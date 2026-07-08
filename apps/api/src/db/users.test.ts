import { describe, expect, it } from "bun:test";

import { createOAuthUserUpserter, type OAuthUserPayload, type UserRow } from "./users";

type QueryCall = {
  sql: string;
  values: readonly unknown[];
};

type FakeQueryResult<TRow> = {
  rows: TRow[];
};

type FakeTransactionClient = {
  query: <TRow = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ) => Promise<FakeQueryResult<TRow>>;
};

const oauthPayload: OAuthUserPayload = {
  provider: "google",
  providerId: "google-user-001",
  providerLogin: "maya",
  email: "maya@example.com",
  name: "Maya Chen",
  avatarUrl: "https://example.com/avatar.png",
  profileUrl: "https://profiles.google.com/maya",
};

const existingUser: UserRow = {
  user_id: "9d7f3c0b-2f56-43d4-98c1-25d63bf57f12",
  name: "Maya Chen",
  email: "maya@example.com",
  github_id: null,
  github_url: null,
  github_login: null,
  avatar_url: null,
};

describe("createOAuthUserUpserter", () => {
  it("links a new OAuth account to an existing user by email inside one pg transaction", async () => {
    const queries: QueryCall[] = [];
    let transactionStarted = false;

    const fakeClient: FakeTransactionClient = {
      query: async <TRow>(sql: string, values: readonly unknown[] = []) => {
        queries.push({ sql, values });

        if (sql.includes("FROM oauth_accounts")) {
          return { rows: [] as TRow[] };
        }

        if (sql.includes("INSERT INTO users")) {
          return { rows: [existingUser] as TRow[] };
        }

        if (sql.includes("INSERT INTO oauth_accounts")) {
          return { rows: [] as TRow[] };
        }

        throw new Error(`Unexpected SQL in test: ${sql}`);
      },
    };

    const upsertUserFromOAuth = createOAuthUserUpserter({
      runInTransaction: async (runner) => {
        transactionStarted = true;
        return runner(fakeClient);
      },
    });

    const user = await upsertUserFromOAuth(oauthPayload);

    expect(transactionStarted).toBe(true);
    expect(user).toEqual(existingUser);
    expect(
      queries.some(
        ({ sql, values }) =>
          sql.includes("INSERT INTO oauth_accounts") &&
          values.includes(oauthPayload.provider) &&
          values.includes(oauthPayload.providerId) &&
          values.includes(existingUser.user_id),
      ),
    ).toBe(true);
  });
});
