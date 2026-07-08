import { query, withTransaction } from "./pool";

export type GithubUser = {
  githubId: string;
  githubLogin: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type UserRow = {
  user_id: string;
  name: string;
  email: string;
  github_id: string | null;
  github_url: string | null;
  github_login: string | null;
  avatar_url: string | null;
};

export const upsertUserFromGithub = async (githubUser: GithubUser): Promise<UserRow | undefined> => {
  const sql = `
    INSERT INTO users (
      name,
      email,
      github_id,
      github_url,
      github_login,
      avatar_url,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (github_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      github_url = EXCLUDED.github_url,
      github_login = EXCLUDED.github_login,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING user_id, name, email, github_id, github_url, github_login, avatar_url;
  `;

  const values = [
    githubUser.name,
    githubUser.email,
    githubUser.githubId,
    `https://github.com/${githubUser.githubLogin}`,
    githubUser.githubLogin,
    githubUser.avatarUrl ?? null,
  ];

  const result = await query<UserRow>(sql, values);
  return result.rows[0];
};

export type OAuthUserPayload = {
  provider: string;
  providerId: string;
  providerLogin?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
};

type OAuthAccountUserRow = UserRow & {
  account_id: string;
};

type QueryRows<TRow> = {
  rows: TRow[];
};

type OAuthTransactionClient = {
  query: <TRow = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ) => Promise<QueryRows<TRow>>;
};

type OAuthTransactionRunner = <TValue>(
  runner: (client: OAuthTransactionClient) => Promise<TValue>,
) => Promise<TValue>;

type OAuthUserUpserterDependencies = {
  runInTransaction: OAuthTransactionRunner;
};

const userReturningColumns = `
  user_id,
  name,
  email,
  github_id,
  github_url,
  github_login,
  avatar_url
`;

const selectOAuthAccountUserSql = `
  SELECT
    oa.account_id,
    u.user_id,
    u.name,
    u.email,
    u.github_id,
    u.github_url,
    u.github_login,
    u.avatar_url
  FROM oauth_accounts oa
  INNER JOIN users u ON u.user_id = oa.user_id
  WHERE oa.provider = $1 AND oa.provider_id = $2
  LIMIT 1;
`;

const updateOAuthAccountSql = `
  UPDATE oauth_accounts
  SET
    provider_login = $2,
    profile_url = $3,
    avatar_url = $4,
    updated_at = CURRENT_TIMESTAMP
  WHERE account_id = $1;
`;

const updateMissingUserAvatarSql = `
  UPDATE users
  SET
    avatar_url = $2,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = $1 AND avatar_url IS NULL
  RETURNING ${userReturningColumns};
`;

const upsertUserByEmailSql = `
  INSERT INTO users (
    name,
    email,
    avatar_url,
    updated_at
  )
  VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
  ON CONFLICT (email)
  DO UPDATE SET
    avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
    updated_at = CASE
      WHEN users.avatar_url IS NULL AND EXCLUDED.avatar_url IS NOT NULL
        THEN CURRENT_TIMESTAMP
      ELSE users.updated_at
    END
  RETURNING ${userReturningColumns};
`;

const upsertOAuthAccountSql = `
  INSERT INTO oauth_accounts (
    user_id,
    provider,
    provider_id,
    provider_login,
    profile_url,
    avatar_url,
    updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
  ON CONFLICT (provider, provider_id)
  DO UPDATE SET
    provider_login = EXCLUDED.provider_login,
    profile_url = EXCLUDED.profile_url,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = CURRENT_TIMESTAMP;
`;

const toUserRow = ({ account_id: _accountId, ...user }: OAuthAccountUserRow): UserRow => user;

export const createOAuthUserUpserter = ({
  runInTransaction,
}: OAuthUserUpserterDependencies) => {
  return async (payload: OAuthUserPayload): Promise<UserRow | undefined> => {
    const {
      provider,
      providerId,
      providerLogin,
      email,
      name,
      avatarUrl,
      profileUrl,
    } = payload;

    return runInTransaction(async (client) => {
      const existingAccountResult = await client.query<OAuthAccountUserRow>(
        selectOAuthAccountUserSql,
        [provider, providerId],
      );
      const existingAccount = existingAccountResult.rows[0];

      if (existingAccount) {
        await client.query(updateOAuthAccountSql, [
          existingAccount.account_id,
          providerLogin ?? null,
          profileUrl ?? null,
          avatarUrl ?? null,
        ]);

        if (!existingAccount.avatar_url && avatarUrl) {
          const updatedUserResult = await client.query<UserRow>(
            updateMissingUserAvatarSql,
            [existingAccount.user_id, avatarUrl],
          );

          return updatedUserResult.rows[0] ?? toUserRow(existingAccount);
        }

        return toUserRow(existingAccount);
      }

      const userResult = await client.query<UserRow>(upsertUserByEmailSql, [
        name,
        email,
        avatarUrl ?? null,
      ]);
      const user = userResult.rows[0];

      if (!user) {
        return undefined;
      }

      await client.query(upsertOAuthAccountSql, [
        user.user_id,
        provider,
        providerId,
        providerLogin ?? null,
        profileUrl ?? null,
        avatarUrl ?? null,
      ]);

      return user;
    });
  };
};

export const upsertUserFromOAuth = createOAuthUserUpserter({
  runInTransaction: (runner) =>
    withTransaction((client) => runner(client as OAuthTransactionClient)),
});
