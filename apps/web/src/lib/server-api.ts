import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
};

const getCookieHeader = async () => {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
};

const fetchServer = async <T>(path: string): Promise<T | null> => {
  try {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: cookieHeader
        ? {
            cookie: cookieHeader,
          }
        : undefined,
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as ApiEnvelope<T>;
    if (!body.ok) {
      return null;
    }

    return body.data ?? null;
  } catch {
    return null;
  }
};

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  githubLogin: string;
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
  name: string;
  category: string;
};

export type Project = {
  projectId: string;
  title: string;
  status: string;
  isActive: boolean;
  description?: string;
};

export type Experience = {
  experienceId: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
};

export type Resume = {
  resumeId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  status: string;
  updatedAt: string;
};

export const getSessionServer = () => fetchServer<SessionUser | null>("/auth/session");
export const getSummaryServer = () => fetchServer<SummaryData>("/users/me/summary");
export const getProjectsServer = () => fetchServer<Project[]>("/projects");
export const getSkillsServer = () => fetchServer<Skill[]>("/skills");
export const getExperiencesServer = () => fetchServer<Experience[]>("/experiences");
export const getResumesServer = () => fetchServer<Resume[]>("/resumes");
