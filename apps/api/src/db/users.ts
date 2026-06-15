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

import { prisma } from "./prisma";
import type { Prisma } from "../generated/prisma/client";

export type OAuthUserPayload = {
  provider: string;
  providerId: string;
  providerLogin?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
};

export const upsertUserFromOAuth = async (payload: OAuthUserPayload): Promise<UserRow | undefined> => {
  const { provider, providerId, providerLogin, email, name, avatarUrl, profileUrl } = payload;

  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Find existing OAuth Account
    const existingAccount = await tx.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      // Update account details if needed
      await tx.oAuthAccount.update({
        where: { accountId: existingAccount.accountId },
        data: {
          providerLogin: providerLogin ?? null,
          profileUrl: profileUrl ?? null,
          avatarUrl: avatarUrl ?? null,
          updatedAt: new Date(),
        },
      });

      // Update avatar if missing
      if (!existingAccount.user.avatarUrl && avatarUrl) {
        await tx.user.update({
          where: { userId: existingAccount.user.userId },
          data: { avatarUrl },
        });
      }

      return existingAccount.user;
    }

    // 2. Link by email or create new user
    let userRecord = await tx.user.findUnique({
      where: { email },
    });

    if (!userRecord) {
      userRecord = await tx.user.create({
        data: {
          name,
          email,
          avatarUrl: avatarUrl ?? null,
        },
      });
    } else if (!userRecord.avatarUrl && avatarUrl) {
      userRecord = await tx.user.update({
        where: { userId: userRecord.userId },
        data: { avatarUrl },
      });
    }

    // 3. Create link
    await tx.oAuthAccount.create({
      data: {
        userId: userRecord.userId,
        provider,
        providerId,
        providerLogin: providerLogin ?? null,
        profileUrl: profileUrl ?? null,
        avatarUrl: avatarUrl ?? null,
      },
    });

    return userRecord;
  });

  if (!user) return undefined;

  return {
    user_id: user.userId,
    name: user.name,
    email: user.email,
    github_id: user.githubId,
    github_url: user.githubUrl,
    github_login: user.githubLogin,
    avatar_url: user.avatarUrl,
  };
};

