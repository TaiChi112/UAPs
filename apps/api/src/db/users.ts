import { query } from "./pool";

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
  github_id: string;
  github_url: string | null;
  github_login: string;
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
