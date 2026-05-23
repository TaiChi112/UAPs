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

export type SummaryData = {
  counts: {
    projects: number;
    skills: number;
    experiences: number;
    resumes: number;
  };
};

export type Skill = {
  skillId: string;
  userId: string;
  name: string;
  category: string;
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
};

export type Project = {
  projectId: string;
  userId: string;
  title: string;
  status: "In Progress" | "Completed" | "On Hold";
  isActive: boolean;
  description?: string;
  repoURL?: string;
  skillIds: string[];
};

export type Experience = {
  experienceId: string;
  userId: string;
  organization: string;
  role: string;
  description?: string;
  achievement?: string;
  startDate?: string;
  endDate?: string;
  skillIds: string[];
};

export type Resume = {
  resumeId: string;
  userId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  visibility: "private" | "public" | "company-only";
  status: "Draft" | "Published" | "Archived";
  isActive: boolean;
  projectIds: string[];
  skillIds: string[];
  experienceIds: string[];
  updatedAt: string;
};

export type RecruiterResumeCard = {
  resumeId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  visibility: "public" | "company-only";
  status: string;
  updatedAt: string;
  ownerName: string;
  ownerGithubLogin?: string;
  skillNames: string[];
  baselineProgress: number;
  experienceYears: number;
};

export type RecruiterResumeQuickView = {
  resumeId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  visibility: "public" | "company-only";
  ownerName: string;
  ownerGithubLogin?: string;
  baseline?: {
    fullName: string;
    headline?: string;
    location?: string;
    summary?: string;
  };
  skills: Array<{ name: string; category: string }>;
  projects: Array<{ title: string; status: string; description?: string }>;
  experiences: Array<{ role: string; organization: string; achievement?: string }>;
  updatedAt: string;
};

export type ResumeAccessRequest = {
  accessRequestId: string;
  resumeId: string;
  resumeVersionName: string;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  purpose: string;
  positionTitle?: string;
  requestedVisibility: "read-only" | "export";
  requestStatus: "pending" | "approved" | "rejected" | "expired" | "revoked";
  createdAt: string;
  reviewedAt?: string;
};

export type ResumeAccessAuditLog = {
  auditId: string;
  resumeId: string;
  resumeVersionName: string;
  action: "view" | "export" | "request" | "approve" | "reject" | "revoke" | "blocked";
  recruiterEmail?: string;
  eventTime: string;
  metadata?: Record<string, unknown>;
};

export type ResumePreview = Resume & {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
};

export type ResumeBaseline = {
  resumeId: string;
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  summary?: string;
  updatedAt: string;
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
export const getSummary = async () => (await request<SummaryData>("/users/me/summary")).data;

export const getSkills = async () => (await request<Skill[]>("/skills")).data ?? [];
export const createSkill = async (payload: Pick<Skill, "name" | "category" | "proficiencyLevel">) =>
  toMutationResult(request<Skill>("/skills", { method: "POST", body: JSON.stringify(payload) }));
export const updateSkillById = async (skillId: string, payload: Pick<Skill, "name" | "category" | "proficiencyLevel">) =>
  toMutationResult(request<Skill>(`/skills/${skillId}`, { method: "PUT", body: JSON.stringify(payload) }));
export const deleteSkillById = async (skillId: string) =>
  toMutationResult(request<null>(`/skills/${skillId}`, { method: "DELETE" }));

export const getProjects = async () => (await request<Project[]>("/projects")).data ?? [];
export const createProject = async (
  payload: Pick<Project, "title" | "description" | "repoURL" | "status" | "isActive" | "skillIds">,
) => toMutationResult(request<Project>("/projects", { method: "POST", body: JSON.stringify(payload) }));
export const updateProjectById = async (
  projectId: string,
  payload: Pick<Project, "title" | "description" | "repoURL" | "status" | "isActive" | "skillIds">,
) => toMutationResult(request<Project>(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(payload) }));
export const deleteProjectById = async (projectId: string) =>
  toMutationResult(request<null>(`/projects/${projectId}`, { method: "DELETE" }));

export const getExperiences = async () => (await request<Experience[]>("/experiences")).data ?? [];
export const createExperience = async (
  payload: Pick<Experience, "organization" | "role" | "description" | "achievement" | "startDate" | "endDate" | "skillIds">,
) => toMutationResult(request<Experience>("/experiences", { method: "POST", body: JSON.stringify(payload) }));
export const updateExperienceById = async (
  experienceId: string,
  payload: Pick<Experience, "organization" | "role" | "description" | "achievement" | "startDate" | "endDate" | "skillIds">,
) =>
  toMutationResult(request<Experience>(`/experiences/${experienceId}`, { method: "PUT", body: JSON.stringify(payload) }));
export const deleteExperienceById = async (experienceId: string) =>
  toMutationResult(request<null>(`/experiences/${experienceId}`, { method: "DELETE" }));

export const getResumes = async () => (await request<Resume[]>("/resumes")).data ?? [];
export const createResume = async (
  payload: Pick<Resume, "versionName" | "targetJobTitle" | "targetCompany" | "visibility" | "status" | "isActive">,
) => toMutationResult(request<Resume>("/resumes", { method: "POST", body: JSON.stringify(payload) }));
export const updateResumeById = async (
  resumeId: string,
  payload: Pick<Resume, "versionName" | "targetJobTitle" | "targetCompany" | "visibility" | "status" | "isActive">,
) => toMutationResult(request<Resume>(`/resumes/${resumeId}`, { method: "PUT", body: JSON.stringify(payload) }));
export const deleteResumeById = async (resumeId: string) =>
  toMutationResult(request<null>(`/resumes/${resumeId}`, { method: "DELETE" }));

export const composeResume = async (
  resumeId: string,
  payload: { projectIds: string[]; skillIds: string[]; experienceIds: string[] },
) => toMutationResult(request<Resume>(`/resumes/${resumeId}/compose`, { method: "POST", body: JSON.stringify(payload) }));

export const getResumePreview = async (resumeId: string) => (await request<ResumePreview>(`/resumes/${resumeId}/preview`)).data;
export const getResumeBaseline = async (resumeId: string) =>
  (await request<ResumeBaseline | null>(`/resumes/${resumeId}/baseline`)).data;
export const upsertResumeBaseline = async (
  resumeId: string,
  payload: Omit<ResumeBaseline, "resumeId" | "updatedAt">,
) => toMutationResult(request<ResumeBaseline>(`/resumes/${resumeId}/baseline`, { method: "PUT", body: JSON.stringify(payload) }));

export const searchRecruiterResumes = async (params: {
  jobTitle?: string;
  requiredSkills?: string[];
  experienceKeyword?: string;
  minExperienceYears?: number;
  visibility?: "public" | "company-only";
}) => {
  const url = new URL(`${API_BASE_URL}/hr/resumes`);
  if (params.jobTitle) {
    url.searchParams.set("jobTitle", params.jobTitle);
  }
  if (params.requiredSkills && params.requiredSkills.length > 0) {
    url.searchParams.set("requiredSkills", params.requiredSkills.join(","));
  }
  if (params.experienceKeyword) {
    url.searchParams.set("experienceKeyword", params.experienceKeyword);
  }
  if (typeof params.minExperienceYears === "number") {
    url.searchParams.set("minExperienceYears", String(params.minExperienceYears));
  }
  if (params.visibility) {
    url.searchParams.set("visibility", params.visibility);
  }

  const response = await fetch(url.toString(), {
    credentials: "include",
    cache: "no-store",
  });

  const body = (await response.json()) as ApiEnvelope<RecruiterResumeCard[]>;
  return body.data ?? [];
};

export const getRecruiterResumeQuickView = async (resumeId: string) =>
  (await request<RecruiterResumeQuickView>(`/hr/resumes/${resumeId}/quick-view`)).data;

export const createRecruiterAccessRequest = async (payload: {
  resumeId: string;
  companyName: string;
  companyDomain?: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterRoleTitle?: string;
  purpose: string;
  positionTitle?: string;
  requestedVisibility?: "read-only" | "export";
}) => toMutationResult(request<{ accessRequestId: string }>("/hr/access-requests", { method: "POST", body: JSON.stringify(payload) }));

export const getOwnerAccessRequests = async (status?: ResumeAccessRequest["requestStatus"]) => {
  const path = status ? `/resumes/access-requests?status=${encodeURIComponent(status)}` : "/resumes/access-requests";
  return (await request<ResumeAccessRequest[]>(path)).data ?? [];
};

export const reviewOwnerAccessRequest = async (
  requestId: string,
  payload: { decision: "approve" | "reject"; note?: string },
) => toMutationResult(request<{ accessRequestId: string }>(`/resumes/access-requests/${requestId}/review`, { method: "POST", body: JSON.stringify(payload) }));

export const getOwnerAccessAuditLogs = async (resumeId?: string) => {
  const path = resumeId ? `/resumes/access-audit-logs?resumeId=${encodeURIComponent(resumeId)}` : "/resumes/access-audit-logs";
  return (await request<ResumeAccessAuditLog[]>(path)).data ?? [];
};

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
