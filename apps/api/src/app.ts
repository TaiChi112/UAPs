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
import { upsertUserFromGithub } from "./db/users";
import { vaultBackendRepository } from "./db/index";

import {
  mapResumeBuilderExportPayload,
  renderResumeBuilderPdf,
} from "./resume-builder-export";
import {
  analyzeJobDescriptionRequestSchema,
  createSkillInputSchema as resumeBuilderCreateSkillInputSchema,
  duplicateResumeBodySchema,
  newProjectDraftSchema,
  resumeIdParamSchema,
  updateResumeStatusBodySchema,
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
  .get("/auth/github/start", async (ctx) => {
    if (isSinglePlayerMode()) {
      const returnTo = getReturnToUrl(
        typeof ctx.query.returnTo === "string" ? ctx.query.returnTo : undefined,
      );

      return Response.redirect(returnTo, 302);
    }

    if (!mustHaveGithubConfig()) {
      ctx.set.status = 500;
      return {
        ok: false,
        error: {
          code: "AUTH_CONFIG_MISSING",
          message: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required",
        },
      };
    }

    const returnTo = getReturnToUrl(typeof ctx.query.returnTo === "string" ? ctx.query.returnTo : undefined);
    const state = await createOauthState({ nonce: crypto.randomUUID(), returnTo });

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", githubClientId!);
    authorizeUrl.searchParams.set("redirect_uri", githubRedirectUri);
    authorizeUrl.searchParams.set("scope", "read:user user:email");
    authorizeUrl.searchParams.set("state", state);

    return Response.redirect(authorizeUrl.toString(), 302);
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
  .get("/auth/github/callback", async (ctx) => {
    try {
      if (isSinglePlayerMode()) {
        const returnTo = getReturnToUrl(
          typeof ctx.query.returnTo === "string" ? ctx.query.returnTo : undefined,
        );

        return Response.redirect(returnTo, 302);
      }

      if (!mustHaveGithubConfig()) {
        ctx.set.status = 500;
        return {
          ok: false,
          error: {
            code: "AUTH_CONFIG_MISSING",
            message: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required",
          },
        };
      }

      const code = typeof ctx.query.code === "string" ? ctx.query.code : undefined;
      const stateToken = typeof ctx.query.state === "string" ? ctx.query.state : undefined;

      if (!code || !stateToken) {
        ctx.set.status = 400;
        return {
          ok: false,
          error: {
            code: "INVALID_CALLBACK",
            message: "Missing code or state from GitHub callback",
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
        ctx.set.status = 502;
        return {
          ok: false,
          error: {
            code: "GITHUB_TOKEN_EXCHANGE_FAILED",
            message: "Failed to exchange OAuth code with GitHub",
          },
        };
      }

      const tokenBody = (await tokenResponse.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
        error_uri?: string;
      };

      if (!tokenBody.access_token) {
        ctx.set.status = 502;
        return {
          ok: false,
          error: {
            code: "GITHUB_ACCESS_TOKEN_MISSING",
            message: tokenBody.error_description ?? tokenBody.error ?? "GitHub did not return an access token",
            details: {
              githubError: tokenBody.error,
              githubErrorUri: tokenBody.error_uri,
            },
          },
        };
      }

      const [githubUserRes, githubEmailsRes] = await Promise.all([
        fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokenBody.access_token}`,
            Accept: "application/vnd.github+json",
          },
        }),
        fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokenBody.access_token}`,
            Accept: "application/vnd.github+json",
          },
        }),
      ]);

      if (!githubUserRes.ok || !githubEmailsRes.ok) {
        ctx.set.status = 502;
        return {
          ok: false,
          error: {
            code: "GITHUB_PROFILE_FETCH_FAILED",
            message: "Unable to fetch profile data from GitHub",
          },
        };
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
        ctx.set.status = 400;
        return {
          ok: false,
          error: {
            code: "EMAIL_REQUIRED",
            message: "Verified email is required from GitHub account",
          },
        };
      }

      const mappedUser = await upsertUserFromGithub({
        githubId: String(githubUser.id),
        githubLogin: githubUser.login,
        name: githubUser.name ?? githubUser.login,
        email: primaryEmail,
        avatarUrl: githubUser.avatar_url,
      });

      if (!mappedUser) {
        ctx.set.status = 500;
        return {
          ok: false,
          error: {
            code: "USER_MAPPING_FAILED",
            message: "Unable to map GitHub user to UAPS user record",
          },
        };
      }

      const sessionToken = await createSessionToken({
        sub: mappedUser.user_id,
        email: mappedUser.email,
        name: mappedUser.name,
        githubId: mappedUser.github_id,
        githubLogin: githubUser.login,
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
      ctx.set.status = error instanceof z.ZodError ? 400 : 500;
      return formatError(error, "Unable to analyze job description");
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
  .get("/resume-builder/resumes/:resumeId/export", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const { resumeId } = resumeIdParamSchema.parse(ctx.params);
      const savedResume = await vaultBackendRepository.getSavedResumeById(
        ctx.userId,
        resumeId,
      );

      if (!savedResume) {
        ctx.set.status = 404;
        return notFoundError("Resume builder resume");
      }

      const vault = await vaultBackendRepository.loadVaultData(ctx.userId);
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
