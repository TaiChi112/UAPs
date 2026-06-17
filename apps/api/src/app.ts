import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { z } from "zod";
import {
  createOauthState,
  createSessionToken,
  getLocalDevSession,
  getSessionCookieName,
  getWebAppUrl,
  isSinglePlayerMode,
  makeExpiredSessionCookie,
  makeSessionCookie,
  parseCookies,
  verifyOauthState,
  verifySessionToken,
} from "./auth";
import { resumeAnalysisService } from "./ai";
import { upsertUserFromGithub, upsertUserFromOAuth } from "./db/users";
import { prisma } from "./db/prisma";
import { vaultBackendRepository } from "./db/index";

import {
  mapResumeBuilderExportPayload,
  renderResumeBuilderPdf,
} from "./resume-builder-export";
import {
  analyzeJobDescriptionRequestSchema,
  createSkillInputSchema as resumeBuilderCreateSkillInputSchema,
  duplicateResumeBodySchema,
  newAwardDraftSchema,
  newCertificateDraftSchema,
  newExperienceDraftSchema,
  newProjectDraftSchema,
  resumeIdParamSchema,
  updateResumeStatusBodySchema,
  updateResumeVisibilityBodySchema,
  upsertSavedResumeBodySchema,
} from "./routes/resume-builder.schemas";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const webAppUrl = getWebAppUrl();
const githubRedirectUri = process.env.GITHUB_REDIRECT_URI ?? `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/github/callback`;

const getReturnToUrl = (value?: string) => {
  if (!value) {
    return `${webAppUrl}/`;
  }

  return value.startsWith(webAppUrl) ? value : `${webAppUrl}/`;
};

const unauthorizedError = {
  ok: false,
  error: {
    code: "UNAUTHORIZED",
    message: "Please sign in with GitHub first",
  },
};

const notFoundError = (resource: string) => ({
  ok: false,
  error: {
    code: "NOT_FOUND",
    message: `${resource} not found`,
  },
});

const requireUserId = (session: Awaited<ReturnType<typeof verifySessionToken>>) => {
  if (!session?.sub) {
    return null;
  }

  return session.sub;
};

const mustHaveGithubConfig = () => {
  return Boolean(githubClientId && githubClientSecret);
};

const formatError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request payload is invalid",
        details: z.treeifyError(error),
      },
    };
  }

  const pgError = error as { code?: string; detail?: string; message?: string };

  if (pgError.code === "23505") {
    return {
      ok: false,
      error: {
        code: "UNIQUE_VIOLATION",
        message: pgError.detail ?? "Duplicate value violates unique constraint",
      },
    };
  }

  return {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: pgError.message ?? fallbackMessage,
    },
  };
};

interface OAuthProviderAdapter {
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<{ accessToken: string; [key: string]: any }>;
  fetchProfile(tokenData: { accessToken: string; [key: string]: any }): Promise<{
    id: string;
    login?: string;
    name: string;
    email: string;
    avatarUrl?: string;
    profileUrl?: string;
  }>;
}

const oauthAdapters: Record<string, OAuthProviderAdapter> = {
  github: {
    getAuthorizationUrl: (state) => {
      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
      authorizeUrl.searchParams.set("client_id", githubClientId!);
      authorizeUrl.searchParams.set("redirect_uri", githubRedirectUri);
      authorizeUrl.searchParams.set("scope", "read:user user:email");
      authorizeUrl.searchParams.set("state", state);
      return authorizeUrl.toString();
    },
    exchangeCode: async (code) => {
      const tokenRequestBody = new URLSearchParams({
        client_id: githubClientId!,
        client_secret: githubClientSecret!,
        code,
        redirect_uri: githubRedirectUri,
      });

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenRequestBody.toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange OAuth code with GitHub");
      }

      const tokenBody = (await tokenResponse.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };

      if (!tokenBody.access_token) {
        throw new Error(tokenBody.error_description ?? "GitHub did not return an access token");
      }

      return { accessToken: tokenBody.access_token };
    },
    fetchProfile: async ({ accessToken }) => {
      const [githubUserRes, githubEmailsRes] = await Promise.all([
        fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "uaps-api",
          },
        }),
        fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "uaps-api",
          },
        }),
      ]);

      if (!githubUserRes.ok || !githubEmailsRes.ok) {
        throw new Error("Unable to fetch profile data from GitHub");
      }

      const githubUser = (await githubUserRes.json()) as {
        id: number;
        login: string;
        name?: string;
        email?: string;
        avatar_url?: string;
      };

      const githubEmailsRaw = (await githubEmailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const githubEmails = Array.isArray(githubEmailsRaw) ? githubEmailsRaw : [];

      const primaryEmail =
        githubEmails.find((item) => item.primary && item.verified)?.email ??
        githubEmails.find((item) => item.verified)?.email ??
        githubUser.email;

      if (!primaryEmail) {
        throw new Error("Verified email is required from GitHub account");
      }

      return {
        id: String(githubUser.id),
        login: githubUser.login,
        name: githubUser.name ?? githubUser.login,
        email: primaryEmail,
        avatarUrl: githubUser.avatar_url,
        profileUrl: `https://github.com/${githubUser.login}`,
      };
    },
  },
  google: {
    getAuthorizationUrl: (state) => {
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "google-client-id-placeholder");
      url.searchParams.set("redirect_uri", `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/google/callback`);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "openid email profile");
      url.searchParams.set("state", state);
      return url.toString();
    },
    exchangeCode: async (code) => {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return { accessToken: "mock-google-token" };
      }
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/google/callback`,
        }).toString(),
      });
      if (!res.ok) throw new Error("Google token exchange failed");
      const body = await res.json() as { access_token?: string };
      return { accessToken: body.access_token || "" };
    },
    fetchProfile: async ({ accessToken }) => {
      if (accessToken === "mock-google-token") {
        return {
          id: "google-mock-id-001",
          login: "google_dev",
          name: "Google Developer",
          email: "google.dev@uaps.local",
          avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
        };
      }
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch Google userinfo");
      const user = await res.json() as { sub: string; name: string; email: string; picture?: string };
      return {
        id: user.sub,
        login: user.email.split("@")[0],
        name: user.name,
        email: user.email,
        avatarUrl: user.picture,
      };
    },
  },
  discord: {
    getAuthorizationUrl: (state) => {
      const url = new URL("https://discord.com/api/oauth2/authorize");
      url.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID || "discord-client-id-placeholder");
      const redirectUri = process.env.DISCORD_REDIRECT_URI ?? `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/discord/callback`;
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "identify email");
      url.searchParams.set("state", state);
      return url.toString();
    },
    exchangeCode: async (code) => {
      if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
        return { accessToken: "mock-discord-token" };
      }
      const redirectUri = process.env.DISCORD_REDIRECT_URI ?? `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/discord/callback`;
      const res = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }).toString(),
      });
      if (!res.ok) throw new Error("Discord token exchange failed");
      const body = await res.json() as { access_token?: string };
      return { accessToken: body.access_token || "" };
    },
    fetchProfile: async ({ accessToken }) => {
      if (accessToken === "mock-discord-token") {
        return {
          id: "discord-mock-id-001",
          login: "discord_dev",
          name: "Discord Dev",
          email: "discord.dev@uaps.local",
          avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
        };
      }
      const res = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch Discord user profile");
      const user = await res.json() as { id: string; username: string; email?: string; avatar?: string };
      return {
        id: user.id,
        login: user.username,
        name: user.username,
        email: user.email || `${user.username}@discord.uaps.local`,
        avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined,
      };
    },
  },
  line: {
    getAuthorizationUrl: (state) => {
      const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
      url.searchParams.set("client_id", process.env.LINE_CHANNEL_ID || "line-channel-id-placeholder");
      const redirectUri = process.env.LINE_CALLBACK_URL ?? `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/line/callback`;
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "profile openid email");
      url.searchParams.set("state", state);
      return url.toString();
    },
    exchangeCode: async (code) => {
      if (!process.env.LINE_CHANNEL_ID || !process.env.LINE_CHANNEL_SECRET) {
        return { accessToken: "mock-line-token" };
      }
      const redirectUri = process.env.LINE_CALLBACK_URL ?? `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/line/callback`;
      const res = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: process.env.LINE_CHANNEL_ID,
          client_secret: process.env.LINE_CHANNEL_SECRET,
        }).toString(),
      });
      if (!res.ok) throw new Error("Line token exchange failed");
      const body = await res.json() as { access_token?: string; id_token?: string };
      return { accessToken: body.access_token || "", idToken: body.id_token };
    },
    fetchProfile: async ({ accessToken, idToken }) => {
      if (accessToken === "mock-line-token") {
        return {
          id: "line-mock-id-001",
          login: "line_dev",
          name: "Line Developer",
          email: "line.dev@uaps.local",
        };
      }
      const res = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch Line user profile");
      const user = await res.json() as { userId: string; displayName: string; pictureUrl?: string };
      
      let email = `${user.userId}@line.uaps.local`;
      if (idToken) {
        try {
          const base64Url = idToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decoded = JSON.parse(jsonPayload);
          if (decoded.email) email = decoded.email;
        } catch (e) {
          console.warn("Failed to decode Line ID token for email", e);
        }
      }

      return {
        id: user.userId,
        login: user.userId,
        name: user.displayName,
        email,
        avatarUrl: user.pictureUrl,
      };
    },
  },
  facebook: {
    getAuthorizationUrl: (state) => {
      const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
      url.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID || "facebook-client-id-placeholder");
      url.searchParams.set("redirect_uri", `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/facebook/callback`);
      url.searchParams.set("state", state);
      url.searchParams.set("scope", "email,public_profile");
      return url.toString();
    },
    exchangeCode: async () => ({ accessToken: "mock-facebook-token" }),
    fetchProfile: async () => ({
      id: "facebook-mock-id-001",
      login: "facebook_dev",
      name: "Facebook Developer",
      email: "facebook.dev@uaps.local",
    }),
  },
  instagram: {
    getAuthorizationUrl: (state) => {
      const url = new URL("https://api.instagram.com/oauth/authorize");
      url.searchParams.set("client_id", process.env.INSTAGRAM_CLIENT_ID || "instagram-client-id-placeholder");
      url.searchParams.set("redirect_uri", `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/instagram/callback`);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "user_profile,user_media");
      url.searchParams.set("state", state);
      return url.toString();
    },
    exchangeCode: async () => ({ accessToken: "mock-instagram-token" }),
    fetchProfile: async () => ({
      id: "instagram-mock-id-001",
      login: "instagram_dev",
      name: "Instagram Developer",
      email: "instagram.dev@uaps.local",
    }),
  },
};

export const app = new Elysia({ prefix: "/v1" })
  .use(
    cors({
      origin: webAppUrl,
      credentials: true,
    }),
  )
  .get("/health", () => ({ ok: true, service: "uaps-api", time: new Date().toISOString() }))
  .derive(async (ctx) => {
    const cookieName = getSessionCookieName();
    const cookies = parseCookies(ctx.headers.cookie);
    const token = cookies[cookieName];
    const session = isSinglePlayerMode()
      ? await getLocalDevSession()
      : await verifySessionToken(token);

    return {
      session,
      userId: requireUserId(session),
    };
  })
  .get("/auth/:provider/start", async (ctx) => {
    const { provider } = ctx.params;
    const adapter = oauthAdapters[provider.toLowerCase()];

    if (!adapter) {
      ctx.set.status = 404;
      return {
        ok: false,
        error: {
          code: "PROVIDER_NOT_SUPPORTED",
          message: `OAuth provider '${provider}' is not supported.`,
        },
      };
    }

    if (isSinglePlayerMode()) {
      const returnTo = getReturnToUrl(
        typeof ctx.query.returnTo === "string" ? ctx.query.returnTo : undefined,
      );
      return Response.redirect(returnTo, 302);
    }

    const returnTo = getReturnToUrl(typeof ctx.query.returnTo === "string" ? ctx.query.returnTo : undefined);
    const state = await createOauthState({ nonce: crypto.randomUUID(), returnTo });

    const authorizeUrl = adapter.getAuthorizationUrl(state);
    return Response.redirect(authorizeUrl, 302);
  })
  .get("/auth/github/config", () => {
    return {
      ok: true,
      data: {
        singlePlayerMode: isSinglePlayerMode(),
        clientIdConfigured: Boolean(githubClientId),
        clientSecretConfigured: Boolean(githubClientSecret),
        apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:4000",
        webAppUrl,
        redirectUri: githubRedirectUri,
      },
    };
  })
  .get("/auth/:provider/callback", async (ctx) => {
    const { provider } = ctx.params;
    const adapter = oauthAdapters[provider.toLowerCase()];

    if (!adapter) {
      return Response.redirect(`${webAppUrl}/auth/login?error=provider_not_supported`, 302);
    }

    try {
      if (isSinglePlayerMode()) {
        const returnTo = getReturnToUrl(
          typeof ctx.query.returnTo === "string" ? ctx.query.returnTo : undefined,
        );

        return Response.redirect(returnTo, 302);
      }

      const code = typeof ctx.query.code === "string" ? ctx.query.code : undefined;
      const stateToken = typeof ctx.query.state === "string" ? ctx.query.state : undefined;

      if (!code || !stateToken) {
        ctx.set.status = 400;
        return {
          ok: false,
          error: {
            code: "INVALID_CALLBACK",
            message: "Missing code or state from OAuth callback",
          },
        };
      }

      const state = await verifyOauthState(stateToken);
      if (!state) {
        ctx.set.status = 400;
        return {
          ok: false,
          error: {
            code: "INVALID_STATE",
            message: "OAuth state is invalid or expired",
          },
        };
      }

      const tokenData = await adapter.exchangeCode(code);
      const profile = await adapter.fetchProfile(tokenData);

      const mappedUser = await upsertUserFromOAuth({
        provider: provider.toLowerCase(),
        providerId: profile.id,
        providerLogin: profile.login,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
      });

      if (!mappedUser) {
        ctx.set.status = 500;
        return {
          ok: false,
          error: {
            code: "USER_MAPPING_FAILED",
            message: `Unable to map ${provider} user to UAPS user record`,
          },
        };
      }

      const sessionToken = await createSessionToken({
        sub: mappedUser.user_id,
        email: mappedUser.email,
        name: mappedUser.name,
        githubId: mappedUser.github_id ?? profile.id,
        githubLogin: mappedUser.github_login ?? profile.login ?? "",
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: getReturnToUrl(state.returnTo),
          "Set-Cookie": makeSessionCookie(sessionToken),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected OAuth callback failure";
      const loginUrl = new URL(`${webAppUrl}/auth/login`);
      loginUrl.searchParams.set("error", "oauth_callback_internal_error");
      loginUrl.searchParams.set("message", message);
      return Response.redirect(loginUrl.toString(), 302);
    }
  })

  .post("/auth/dev-bypass", async (ctx) => {
    const user = await prisma.user.upsert({
      where: {
        email: "maya.chen.demo@uaps.local",
      },
      update: {
        name: "Maya Chen",
        githubId: "demo-maya-chen-001",
        githubLogin: "maya-chen-demo",
        githubUrl: "https://github.com/maya-chen-demo",
        avatarUrl: "https://avatars.githubusercontent.com/u/1001001?v=4",
      },
      create: {
        email: "maya.chen.demo@uaps.local",
        name: "Maya Chen",
        githubId: "demo-maya-chen-001",
        githubLogin: "maya-chen-demo",
        githubUrl: "https://github.com/maya-chen-demo",
        avatarUrl: "https://avatars.githubusercontent.com/u/1001001?v=4",
      },
    });

    const sessionToken = await createSessionToken({
      sub: user.userId,
      email: user.email,
      name: user.name,
      githubId: user.githubId ?? "demo-maya-chen-001",
      githubLogin: user.githubLogin ?? "maya-chen-demo",
    });

    ctx.set.headers["set-cookie"] = makeSessionCookie(sessionToken);
    return { ok: true };
  })
  .get("/auth/session", ({ session }) => {
    if (!session) {
      return { ok: true, data: null };
    }

    return {
      ok: true,
      data: {
        userId: session.sub,
        email: session.email,
        name: session.name,
        githubLogin: session.githubLogin,
      },
    };
  })
  .post("/auth/logout", (ctx) => {
    if (isSinglePlayerMode()) {
      return { ok: true };
    }

    ctx.set.headers["set-cookie"] = makeExpiredSessionCookie();
    return { ok: true };
  })

  .get("/resume-builder/snapshot", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const snapshot = await vaultBackendRepository.loadSnapshot(ctx.userId);
      return { ok: true, data: snapshot };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to load resume builder snapshot");
    }
  })
  .post("/resume-builder/skills", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = resumeBuilderCreateSkillInputSchema.parse(ctx.body);
      const created = await vaultBackendRepository.createSkill(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume builder skill");
    }
  })
  .post("/resume-builder/projects", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = newProjectDraftSchema.parse(ctx.body);
      const created = await vaultBackendRepository.createProject(
        ctx.userId,
        parsed,
      );
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume builder project");
    }
  })
  .put("/resume-builder/skills/:skillId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = resumeBuilderCreateSkillInputSchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateSkill(ctx.userId, ctx.params.skillId, parsed);
      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder skill");
    }
  })
  .delete("/resume-builder/skills/:skillId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const deleted = await vaultBackendRepository.deleteSkill(ctx.userId, ctx.params.skillId);
      if (!deleted) {
        ctx.set.status = 404;
        return notFoundError("Resume builder skill");
      }
      return { ok: true };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to delete resume builder skill");
    }
  })
  .put("/resume-builder/projects/:projectId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newProjectDraftSchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateProject(ctx.userId, ctx.params.projectId, parsed);
      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder project");
    }
  })
  .delete("/resume-builder/projects/:projectId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const deleted = await vaultBackendRepository.deleteProject(ctx.userId, ctx.params.projectId);
      if (!deleted) {
        ctx.set.status = 404;
        return notFoundError("Resume builder project");
      }
      return { ok: true };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to delete resume builder project");
    }
  })
  .post("/resume-builder/experiences", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newExperienceDraftSchema.parse(ctx.body);
      const created = await vaultBackendRepository.createExperience(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume builder experience");
    }
  })
  .put("/resume-builder/experiences/:experienceId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newExperienceDraftSchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateExperience(ctx.userId, ctx.params.experienceId, parsed);
      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder experience");
    }
  })
  .delete("/resume-builder/experiences/:experienceId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const deleted = await vaultBackendRepository.deleteExperience(ctx.userId, ctx.params.experienceId);
      if (!deleted) {
        ctx.set.status = 404;
        return notFoundError("Resume builder experience");
      }
      return { ok: true };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to delete resume builder experience");
    }
  })
  .post("/resume-builder/certificates", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newCertificateDraftSchema.parse(ctx.body);
      const created = await vaultBackendRepository.createCertificate(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume builder certificate");
    }
  })
  .put("/resume-builder/certificates/:certificateId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newCertificateDraftSchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateCertificate(ctx.userId, ctx.params.certificateId, parsed);
      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder certificate");
    }
  })
  .delete("/resume-builder/certificates/:certificateId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const deleted = await vaultBackendRepository.deleteCertificate(ctx.userId, ctx.params.certificateId);
      if (!deleted) {
        ctx.set.status = 404;
        return notFoundError("Resume builder certificate");
      }
      return { ok: true };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to delete resume builder certificate");
    }
  })
  .post("/resume-builder/awards", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newAwardDraftSchema.parse(ctx.body);
      const created = await vaultBackendRepository.createAward(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume builder award");
    }
  })
  .put("/resume-builder/awards/:awardId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const parsed = newAwardDraftSchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateAward(ctx.userId, ctx.params.awardId, parsed);
      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder award");
    }
  })
  .delete("/resume-builder/awards/:awardId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }
    try {
      const deleted = await vaultBackendRepository.deleteAward(ctx.userId, ctx.params.awardId);
      if (!deleted) {
        ctx.set.status = 404;
        return notFoundError("Resume builder award");
      }
      return { ok: true };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to delete resume builder award");
    }
  })
  .post("/resume-builder/analyze-jd", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = analyzeJobDescriptionRequestSchema.parse(ctx.body);
      const analysis = await resumeAnalysisService.analyzeJobDescription(parsed);

      return { ok: true, data: analysis };
    } catch (error) {
      console.error("[analyze-jd] AI generation failed:", error);
      ctx.set.status = error instanceof z.ZodError ? 400 : 500;
      return formatError(error, "Unable to analyze job description");
    }
  })
  .get("/resume-builder/resumes/public", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const publicResumes = await vaultBackendRepository.getPublicResumes();
      return { ok: true, data: publicResumes };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to fetch public resumes");
    }
  })
  .post("/resume-builder/resumes", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = upsertSavedResumeBodySchema.parse(ctx.body);
      const created = await vaultBackendRepository.saveResume(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume builder resume");
    }
  })
  .put("/resume-builder/resumes/:resumeId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);
      const existingResume = await vaultBackendRepository.getSavedResumeById(
        ctx.userId,
        resumeId,
      );

      if (!existingResume) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      const parsed = upsertSavedResumeBodySchema.parse(ctx.body);
      const updated = await vaultBackendRepository.saveResume(ctx.userId, {
        ...parsed,
        resumeId,
      });

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder resume");
    }
  })
  .post("/resume-builder/resumes/:resumeId/duplicate", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);
      const parsed = duplicateResumeBodySchema.parse(ctx.body);
      const duplicatedResume = await vaultBackendRepository.duplicateResume(
        ctx.userId,
        resumeId,
        parsed.duplicatedAt.trim(),
      );

      if (!duplicatedResume) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      ctx.set.status = 201;
      return { ok: true, data: duplicatedResume };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to duplicate resume builder resume");
    }
  })
  .delete("/resume-builder/resumes/:resumeId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);
      const deleted = await vaultBackendRepository.deleteResume(
        ctx.userId,
        resumeId,
      );

      if (!deleted) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      return { ok: true };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to delete resume builder resume");
    }
  })
  .patch("/resume-builder/resumes/:resumeId/status", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);
      const parsed = updateResumeStatusBodySchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateResumeStatus(
        ctx.userId,
        resumeId,
        parsed.status,
      );

      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder status");
    }
  })
  .patch("/resume-builder/resumes/:resumeId/visibility", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);
      const parsed = updateResumeVisibilityBodySchema.parse(ctx.body);
      const updated = await vaultBackendRepository.updateResumeVisibility(
        ctx.userId,
        resumeId,
        parsed.visibility,
      );

      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume builder visibility");
    }
  })
  .post("/resume-builder/export/preview", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const payload = ctx.body as { resume: any; vault: any };
      if (!payload?.resume || !payload?.vault) {
        ctx.set.status = 400;
        return { error: { message: "Missing resume or vault data in payload" } };
      }

      const exportPayload = mapResumeBuilderExportPayload(payload.resume, payload.vault);
      const pdfBytes = await renderResumeBuilderPdf(exportPayload);

      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${exportPayload.fileName}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      ctx.set.status = 500;
      return formatError(error, "Unable to export resume builder PDF preview");
    }
  })
  .get("/resume-builder/resumes/:resumeId/export", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);

      // Fetch the resume from DB directly to check ownership and visibility
      const resume = await prisma.resume.findUnique({
        where: { resumeId: resumeId.trim() },
        include: { user: true }
      });

      if (!resume || (resume.userId !== ctx.userId && resume.visibility !== "public")) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      const savedResume = await vaultBackendRepository.getSavedResumeById(
        resume.userId,
        resumeId,
      );

      if (!savedResume) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      const vault = await vaultBackendRepository.loadVaultData(resume.userId);
      const exportPayload = mapResumeBuilderExportPayload(savedResume, vault);
      const pdfBytes = await renderResumeBuilderPdf(exportPayload);

      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${exportPayload.fileName}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      ctx.set.status = error instanceof z.ZodError ? 400 : 500;
      return formatError(error, "Unable to export resume builder PDF");
    }
  });
