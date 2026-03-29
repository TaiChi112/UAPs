import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { z } from "zod";
import {
  createOauthState,
  createSessionToken,
  getSessionCookieName,
  getWebAppUrl,
  makeExpiredSessionCookie,
  makeSessionCookie,
  parseCookies,
  verifyOauthState,
  verifySessionToken,
} from "./auth";
import {
  createExperience,
  createProject,
  createResumeAccessRequest,
  createResume,
  createSkill,
  deleteExperience,
  deleteProject,
  deleteResume,
  deleteSkill,
  getRecruiterResumeQuickView,
  getResumeById,
  getResumeBaseline,
  getResumePreview,
  listOwnerAccessAuditLogs,
  listOwnerAccessRequests,
  listRecruiterVisibleResumes,
  listExperiences,
  listProjects,
  listResumes,
  listSkills,
  reviewResumeAccessRequest,
  summarize,
  upsertResumeBaseline,
  updateExperience,
  updateProject,
  updateResume,
  updateResumeComposition,
  updateSkill,
  upsertUserFromGithub,
} from "./db";
import { buildResumeMarkdown, renderResumeImage, renderResumePdf } from "./export-renderer";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const webAppUrl = getWebAppUrl();
const githubRedirectUri = process.env.GITHUB_REDIRECT_URI ?? `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/auth/github/callback`;

const projectInputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  repoURL: z.url().optional(),
  status: z.enum(["In Progress", "Completed", "On Hold"]).optional(),
  isActive: z.boolean().optional(),
  skillIds: z.array(z.uuid()).optional(),
});

const skillInputSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  proficiencyLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
});

const experienceInputSchema = z.object({
  organization: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  achievement: z.string().max(5000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  skillIds: z.array(z.uuid()).optional(),
});

const resumeInputSchema = z.object({
  versionName: z.string().min(1).max(255),
  targetJobTitle: z.string().max(255).optional(),
  targetCompany: z.string().max(255).optional(),
  visibility: z.enum(["private", "public", "company-only"]).optional(),
  status: z.enum(["Draft", "Published", "Archived"]).optional(),
  isActive: z.boolean().optional(),
});

const resumeCompositionSchema = z.object({
  projectIds: z.array(z.uuid()).default([]),
  skillIds: z.array(z.uuid()).default([]),
  experienceIds: z.array(z.uuid()).default([]),
});

const resumeBaselineSchema = z.object({
  fullName: z.string().min(1).max(255),
  headline: z.string().max(255).optional(),
  email: z.email().optional(),
  phone: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
  linkedinUrl: z.url().optional(),
  portfolioUrl: z.url().optional(),
  githubUrl: z.url().optional(),
  summary: z.string().max(5000).optional(),
});

const recruiterFilterQuerySchema = z.object({
  jobTitle: z.string().optional(),
  requiredSkills: z.string().optional(),
  experienceKeyword: z.string().optional(),
  minExperienceYears: z.coerce.number().nonnegative().optional(),
  visibility: z.enum(["public", "company-only"]).optional(),
});

const accessRequestSchema = z.object({
  resumeId: z.uuid(),
  companyName: z.string().min(2).max(255),
  companyDomain: z.string().max(255).optional(),
  recruiterName: z.string().min(2).max(255),
  recruiterEmail: z.email(),
  recruiterRoleTitle: z.string().max(255).optional(),
  purpose: z.string().min(10).max(5000),
  positionTitle: z.string().max(255).optional(),
  requestedVisibility: z.enum(["read-only", "export"]).optional(),
});

const accessRequestReviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().max(5000).optional(),
});

const getReturnToUrl = (value?: string) => {
  if (!value) {
    return `${webAppUrl}/dashboard`;
  }

  return value.startsWith(webAppUrl) ? value : `${webAppUrl}/dashboard`;
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
    const session = await verifySessionToken(token);

    return {
      session,
      userId: requireUserId(session),
    };
  })
  .get("/auth/github/start", async (ctx) => {
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
    ctx.set.headers["set-cookie"] = makeExpiredSessionCookie();
    return { ok: true };
  })
  .get("/hr/resumes", async (ctx) => {
    try {
      const query = recruiterFilterQuerySchema.parse(ctx.query);
      const requiredSkills = query.requiredSkills
        ? query.requiredSkills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const data = await listRecruiterVisibleResumes({
        jobTitle: query.jobTitle,
        requiredSkills,
        experienceKeyword: query.experienceKeyword,
        minExperienceYears: query.minExperienceYears,
        visibility: query.visibility,
      });

      return { ok: true, data };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to search resumes");
    }
  })
  .get("/hr/resumes/:resumeId/quick-view", async (ctx) => {
    const resume = await getRecruiterResumeQuickView(ctx.params.resumeId);
    if (!resume) {
      ctx.set.status = 404;
      return notFoundError("Public resume");
    }

    return { ok: true, data: resume };
  })
  .post("/hr/access-requests", async (ctx) => {
    try {
      const parsed = accessRequestSchema.parse(ctx.body);
      const accessRequestId = await createResumeAccessRequest({
        ...parsed,
        ipAddress: ctx.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
        userAgent: ctx.request.headers.get("user-agent") ?? undefined,
        referrer: ctx.request.headers.get("referer") ?? undefined,
      });

      if (!accessRequestId) {
        ctx.set.status = 404;
        return notFoundError("Public resume");
      }

      ctx.set.status = 201;
      return { ok: true, data: { accessRequestId } };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create access request");
    }
  })
  .get("/users/me/summary", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    return { ok: true, data: await summarize(ctx.userId) };
  })
  .get("/skills", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    return { ok: true, data: await listSkills(ctx.userId) };
  })
  .post("/skills", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = skillInputSchema.parse(ctx.body);
      const created = await createSkill(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create skill");
    }
  })
  .put("/skills/:skillId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = skillInputSchema.parse(ctx.body);
      const updated = await updateSkill(ctx.userId, ctx.params.skillId, parsed);
      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Skill");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update skill");
    }
  })
  .delete("/skills/:skillId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const deleted = await deleteSkill(ctx.userId, ctx.params.skillId);
    if (!deleted) {
      ctx.set.status = 404;
      return notFoundError("Skill");
    }

    return { ok: true };
  })
  .get("/projects", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    return { ok: true, data: await listProjects(ctx.userId) };
  })
  .post("/projects", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = projectInputSchema.parse(ctx.body);
      const created = await createProject(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create project");
    }
  })
  .put("/projects/:projectId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = projectInputSchema.parse(ctx.body);
      const updated = await updateProject(ctx.userId, ctx.params.projectId, parsed);
      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Project");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update project");
    }
  })
  .delete("/projects/:projectId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const deleted = await deleteProject(ctx.userId, ctx.params.projectId);
    if (!deleted) {
      ctx.set.status = 404;
      return notFoundError("Project");
    }

    return { ok: true };
  })
  .get("/experiences", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    return { ok: true, data: await listExperiences(ctx.userId) };
  })
  .post("/experiences", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = experienceInputSchema.parse(ctx.body);
      const created = await createExperience(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create experience");
    }
  })
  .put("/experiences/:experienceId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = experienceInputSchema.parse(ctx.body);
      const updated = await updateExperience(ctx.userId, ctx.params.experienceId, parsed);
      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Experience");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update experience");
    }
  })
  .delete("/experiences/:experienceId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const deleted = await deleteExperience(ctx.userId, ctx.params.experienceId);
    if (!deleted) {
      ctx.set.status = 404;
      return notFoundError("Experience");
    }

    return { ok: true };
  })
  .get("/resumes", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    return { ok: true, data: await listResumes(ctx.userId) };
  })
  .post("/resumes", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = resumeInputSchema.parse(ctx.body);
      const created = await createResume(ctx.userId, parsed);
      ctx.set.status = 201;
      return { ok: true, data: created };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to create resume");
    }
  })
  .put("/resumes/:resumeId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = resumeInputSchema.parse(ctx.body);
      const updated = await updateResume(ctx.userId, ctx.params.resumeId, parsed);
      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Resume");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume");
    }
  })
  .delete("/resumes/:resumeId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const deleted = await deleteResume(ctx.userId, ctx.params.resumeId);
    if (!deleted) {
      ctx.set.status = 404;
      return notFoundError("Resume");
    }

    return { ok: true };
  })
  .post("/resumes/:resumeId/compose", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = resumeCompositionSchema.parse(ctx.body);
      const updated = await updateResumeComposition(ctx.userId, ctx.params.resumeId, parsed);
      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Resume");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume composition");
    }
  })
  .get("/resumes/:resumeId/baseline", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const baseline = await getResumeBaseline(ctx.userId, ctx.params.resumeId);
    return { ok: true, data: baseline };
  })
  .put("/resumes/:resumeId/baseline", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = resumeBaselineSchema.parse(ctx.body);
      const updated = await upsertResumeBaseline(ctx.userId, ctx.params.resumeId, parsed);
      if (!updated) {
        ctx.set.status = 404;
        return notFoundError("Resume");
      }

      return { ok: true, data: updated };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to update resume baseline");
    }
  })
  .get("/resumes/access-requests", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const status = typeof ctx.query.status === "string" ? ctx.query.status : undefined;
    return { ok: true, data: await listOwnerAccessRequests(ctx.userId, status) };
  })
  .post("/resumes/access-requests/:requestId/review", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    try {
      const parsed = accessRequestReviewSchema.parse(ctx.body);
      const reviewedId = await reviewResumeAccessRequest(ctx.userId, ctx.params.requestId, parsed.decision, parsed.note);
      if (!reviewedId) {
        ctx.set.status = 404;
        return notFoundError("Access request");
      }

      return { ok: true, data: { accessRequestId: reviewedId } };
    } catch (error) {
      ctx.set.status = 400;
      return formatError(error, "Unable to review access request");
    }
  })
  .get("/resumes/access-audit-logs", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const resumeId = typeof ctx.query.resumeId === "string" ? ctx.query.resumeId : undefined;
    return { ok: true, data: await listOwnerAccessAuditLogs(ctx.userId, resumeId) };
  })
  .get("/resumes/:resumeId/preview", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const preview = await getResumePreview(ctx.userId, ctx.params.resumeId);
    if (!preview) {
      ctx.set.status = 404;
      return notFoundError("Resume");
    }

    return { ok: true, data: preview };
  })
  .get("/resumes/:resumeId/export/:format", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const preview = await getResumePreview(ctx.userId, ctx.params.resumeId);
    if (!preview) {
      ctx.set.status = 404;
      return notFoundError("Resume");
    }

    const format = ctx.params.format;

    if (format === "json") {
      return { ok: true, format: "json", data: preview };
    }

    const markdown = buildResumeMarkdown(preview);
    if (format === "md") {
      return { ok: true, format: "md", data: markdown };
    }

    if (format === "image") {
      const png = renderResumeImage(preview);
      const fileName = `${preview.versionName.replaceAll(/\s+/g, "-").toLowerCase()}.png`;
      return new Response(png, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    if (format === "pdf") {
      const pdf = await renderResumePdf(preview);
      const fileName = `${preview.versionName.replaceAll(/\s+/g, "-").toLowerCase()}.pdf`;
      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    ctx.set.status = 400;
    return {
      ok: false,
      error: {
        code: "INVALID_FORMAT",
        message: "Supported formats are: json, md, pdf, image",
      },
    };
  })
  .get("/resumes/:resumeId", async (ctx) => {
    if (!ctx.userId) {
      ctx.set.status = 401;
      return unauthorizedError;
    }

    const resume = await getResumeById(ctx.userId, ctx.params.resumeId);
    if (!resume) {
      ctx.set.status = 404;
      return notFoundError("Resume");
    }

    return { ok: true, data: resume };
  });
