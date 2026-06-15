const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";
const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? "http://localhost:3000";

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type BinaryDownloadPayload = {
  blob: Blob;
  fileName: string;
};

const request = async <T>(path: string, options?: RequestInit) => {
  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options?.headers) {
    Object.assign(mergedHeaders, options.headers);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: mergedHeaders,
  });

  if (response.status === 204) {
    return { ok: true, data: null as T | null };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: response.ok,
      data: null as T | null,
      error: {
        code: response.ok ? "NO_JSON" : "REQUEST_FAILED",
        message: response.ok ? "No JSON payload" : `Request failed with status ${response.status}`,
      },
      response,
    };
  }

  const body = (await response.json()) as ApiEnvelope<T>;

  return {
    ok: response.ok && body.ok,
    data: (body.data ?? null) as T | null,
    error: body.error,
    response,
  };
};

const extractFileName = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(contentDisposition);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const plainMatch = /filename=([^;]+)/i.exec(contentDisposition);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return fallback;
};

const downloadBinary = async (
  path: string,
  fallbackFileName: string,
  options?: RequestInit,
): Promise<MutationResult<BinaryDownloadPayload>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await response.json()) as ApiEnvelope<null>;
      return {
        ok: false,
        data: null,
        message: body.error?.message ?? `Request failed with status ${response.status}`,
        statusCode: response.status,
      };
    }

    return {
      ok: false,
      data: null,
      message: `Request failed with status ${response.status}`,
      statusCode: response.status,
    };
  }

  const blob = await response.blob();
  const fileName = extractFileName(
    response.headers.get("content-disposition"),
    fallbackFileName,
  );

  return {
    ok: true,
    data: {
      blob,
      fileName,
    },
    statusCode: response.status,
  };
};

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  githubLogin: string;
};

export type MutationResult<T> = {
  ok: boolean;
  data: T | null;
  message?: string;
  statusCode?: number;
};

export type ResumeBuilderSnapshotResponse = {
  savedResumes: import("@uaps/shared/resume-builder").SavedResume[];
  vault: import("@uaps/shared/resume-builder").VaultData;
};

const toMutationResult = async <T>(promise: Promise<Awaited<ReturnType<typeof request<T>>>>): Promise<MutationResult<T>> => {
  const result = await promise;
  return {
    ok: result.ok,
    data: result.data,
    message: result.error?.message,
    statusCode: result.response?.status,
  };
};

export const buildGithubLoginUrl = (returnTo: string = `${WEB_BASE_URL}/`) => {
  const url = new URL(`${API_BASE_URL}/auth/github/start`);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
};

export const getSession = async () => (await request<SessionUser | null>("/auth/session")).data;

export const logout = async () => (await request<null>("/auth/logout", { method: "POST" })).ok;

export const getResumeBuilderSnapshot = async () =>
  (await request<ResumeBuilderSnapshotResponse>("/resume-builder/snapshot")).data;

export const createResumeBuilderSkill = async (
  payload: import("@uaps/shared/resume-builder").CreateSkillInput,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultSkill>(
      "/resume-builder/skills",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderSkill = async (
  skillId: string,
  payload: import("@uaps/shared/resume-builder").CreateSkillInput,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultSkill>(
      `/resume-builder/skills/${skillId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );

export const deleteResumeBuilderSkill = async (skillId: string) =>
  toMutationResult(
    request<null>(`/resume-builder/skills/${skillId}`, {
      method: "DELETE",
    }),
  );

export const createResumeBuilderProject = async (
  payload: import("@uaps/shared/resume-builder").NewProjectDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultProject>(
      "/resume-builder/projects",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderProject = async (
  projectId: string,
  payload: import("@uaps/shared/resume-builder").NewProjectDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultProject>(
      `/resume-builder/projects/${projectId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );

export const deleteResumeBuilderProject = async (projectId: string) =>
  toMutationResult(
    request<null>(`/resume-builder/projects/${projectId}`, {
      method: "DELETE",
    }),
  );

export const createResumeBuilderExperience = async (
  payload: import("@uaps/shared/resume-builder").NewExperienceDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultExperience>(
      "/resume-builder/experiences",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderExperience = async (
  experienceId: string,
  payload: import("@uaps/shared/resume-builder").NewExperienceDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultExperience>(
      `/resume-builder/experiences/${experienceId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );

export const deleteResumeBuilderExperience = async (experienceId: string) =>
  toMutationResult(
    request<null>(`/resume-builder/experiences/${experienceId}`, {
      method: "DELETE",
    }),
  );

export const createResumeBuilderCertificate = async (
  payload: import("@uaps/shared/resume-builder").NewCertificateDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultCertificate>(
      "/resume-builder/certificates",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderCertificate = async (
  certificateId: string,
  payload: import("@uaps/shared/resume-builder").NewCertificateDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultCertificate>(
      `/resume-builder/certificates/${certificateId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );

export const deleteResumeBuilderCertificate = async (certificateId: string) =>
  toMutationResult(
    request<null>(`/resume-builder/certificates/${certificateId}`, {
      method: "DELETE",
    }),
  );

export const createResumeBuilderAward = async (
  payload: import("@uaps/shared/resume-builder").NewAwardDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultAward>(
      "/resume-builder/awards",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderAward = async (
  awardId: string,
  payload: import("@uaps/shared/resume-builder").NewAwardDraft,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").VaultAward>(
      `/resume-builder/awards/${awardId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );

export const deleteResumeBuilderAward = async (awardId: string) =>
  toMutationResult(
    request<null>(`/resume-builder/awards/${awardId}`, {
      method: "DELETE",
    }),
  );

export const createResumeBuilderResume = async (
  payload: Omit<
    import("@uaps/shared/resume-builder").UpsertSavedResumeInput,
    "resumeId"
  >,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").SavedResume>(
      "/resume-builder/resumes",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderResume = async (
  resumeId: string,
  payload: Omit<
    import("@uaps/shared/resume-builder").UpsertSavedResumeInput,
    "resumeId"
  >,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").SavedResume>(
      `/resume-builder/resumes/${resumeId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );

export const duplicateResumeBuilderResume = async (
  resumeId: string,
  payload: { duplicatedAt: string },
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").SavedResume>(
      `/resume-builder/resumes/${resumeId}/duplicate`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const deleteResumeBuilderResume = async (resumeId: string) =>
  toMutationResult(
    request<null>(`/resume-builder/resumes/${resumeId}`, {
      method: "DELETE",
    }),
  );

export const updateResumeBuilderStatus = async (
  resumeId: string,
  payload: { status: import("@uaps/shared/resume-builder").FeatureResumeStatus },
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").SavedResume>(
      `/resume-builder/resumes/${resumeId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );

export const updateResumeBuilderVisibility = async (
  resumeId: string,
  payload: { visibility: string },
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").SavedResume>(
      `/resume-builder/resumes/${resumeId}/visibility`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );

export const getResumeBuilderPublicResumes = async () =>
  (await request<import("@uaps/shared/resume-builder").SavedResume[]>("/resume-builder/resumes/public")).data;

export const analyzeResumeBuilderJobDescription = async (
  payload: import("@uaps/shared/resume-builder").AnalyzeJobDescriptionRequest,
) =>
  toMutationResult(
    request<import("@uaps/shared/resume-builder").AnalyzeJobDescriptionResult>(
      "/resume-builder/analyze-jd",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );

export const downloadResumeBuilderPdf = async (resumeId: string) =>
  downloadBinary(
    `/resume-builder/resumes/${resumeId}/export`,
    "resume.pdf",
  );

export const previewResumeBuilderPdf = async (
  payload: { resume: import("@uaps/shared/resume-builder").SavedResume; vault: import("@uaps/shared/resume-builder").VaultData }
) =>
  downloadBinary(
    `/resume-builder/export/preview`,
    "resume.pdf",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
