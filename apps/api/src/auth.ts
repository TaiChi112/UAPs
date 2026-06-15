import { jwtVerify, SignJWT } from "jose";

import { prisma } from "./db/prisma";

const textEncoder = new TextEncoder();

const JWT_SECRET = process.env.JWT_SECRET ?? "change-this-secret-in-production";
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "uaps_session";
const webAppUrl = process.env.WEB_APP_URL ?? "http://localhost:3000";
const SINGLE_PLAYER_MODE =
  process.env.SINGLE_PLAYER_MODE === "true" ||
  (process.env.SINGLE_PLAYER_MODE !== "false" &&
    process.env.NODE_ENV !== "production");

const jwtSecret = textEncoder.encode(JWT_SECRET);

declare global {
  var __uapsLocalDevSession__: SessionPayload | undefined;
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  githubId: string;
  githubLogin: string;
};

type StatePayload = {
  nonce: string;
  returnTo?: string;
};

const LOCAL_DEV_USER = {
  email: "maya.chen.demo@uaps.local",
  name: "Maya Chen",
  githubId: "demo-maya-chen-001",
  githubLogin: "maya-chen-demo",
  githubUrl: "https://github.com/maya-chen-demo",
  avatarUrl: "https://avatars.githubusercontent.com/u/1001001?v=4",
} as const;

export const getWebAppUrl = () => webAppUrl;
export const getSessionCookieName = () => SESSION_COOKIE_NAME;
export const isSinglePlayerMode = () => SINGLE_PLAYER_MODE;

export const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey || rawValue.length === 0) {
      return acc;
    }

    acc[rawKey] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
};

export const createSessionToken = async (payload: SessionPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);
};

export const verifySessionToken = async (token?: string) => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
};

export const getLocalDevSession = async (): Promise<SessionPayload> => {
  if (!SINGLE_PLAYER_MODE) {
    throw new Error("Single-player mode is disabled");
  }

  const user = await prisma.user.upsert({
    where: {
      email: LOCAL_DEV_USER.email,
    },
    update: {
      name: LOCAL_DEV_USER.name,
      githubId: LOCAL_DEV_USER.githubId,
      githubLogin: LOCAL_DEV_USER.githubLogin,
      githubUrl: LOCAL_DEV_USER.githubUrl,
      avatarUrl: LOCAL_DEV_USER.avatarUrl,
    },
    create: {
      email: LOCAL_DEV_USER.email,
      name: LOCAL_DEV_USER.name,
      githubId: LOCAL_DEV_USER.githubId,
      githubLogin: LOCAL_DEV_USER.githubLogin,
      githubUrl: LOCAL_DEV_USER.githubUrl,
      avatarUrl: LOCAL_DEV_USER.avatarUrl,
    },
  });

  const session: SessionPayload = {
    sub: user.userId,
    email: user.email,
    name: user.name,
    githubId: user.githubId ?? LOCAL_DEV_USER.githubId,
    githubLogin: user.githubLogin ?? LOCAL_DEV_USER.githubLogin,
  };

  return session;
};

export const createOauthState = async (payload: StatePayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(jwtSecret);
};

export const verifyOauthState = async (token?: string) => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload as StatePayload;
  } catch {
    return null;
  }
};

export const makeSessionCookie = (token: string) => {
  const isSecure = webAppUrl.startsWith("https://");
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isSecure ? "; Secure" : ""}`;
};

export const makeExpiredSessionCookie = () => {
  const isSecure = webAppUrl.startsWith("https://");
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? "; Secure" : ""}`;
};
