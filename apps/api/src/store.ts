import { z } from "zod";

const statuses = ["In Progress", "Completed", "On Hold"] as const;
const resumeStatuses = ["Draft", "Published", "Archived"] as const;

export type Skill = {
  skillId: string;
  userId: string;
  name: string;
  category: string;
};

export type Project = {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  repoURL?: string;
  isActive: boolean;
  status: (typeof statuses)[number];
  skillIds: string[];
  createdAt: string;
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
  isActive: boolean;
  status: (typeof resumeStatuses)[number];
  projectIds: string[];
  skillIds: string[];
  experienceIds: string[];
  createdAt: string;
  updatedAt: string;
};

const skills: Skill[] = [];
const projects: Project[] = [];
const experiences: Experience[] = [];
const resumes: Resume[] = [];

const ensureUniqueSkillName = (userId: string, name: string) => {
  return !skills.some((item) => item.userId === userId && item.name.toLowerCase() === name.toLowerCase());
};

const toIsoDate = (date?: string) => {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
};

const projectStatusSchema = z.enum(statuses);

export const listSkills = (userId: string) => skills.filter((item) => item.userId === userId);
export const listProjects = (userId: string) => projects.filter((item) => item.userId === userId);
export const listExperiences = (userId: string) => experiences.filter((item) => item.userId === userId);
export const getResumeList = (userId: string) => resumes.filter((item) => item.userId === userId);

export const createSkill = (userId: string, input: { name: string; category: string }) => {
  if (!ensureUniqueSkillName(userId, input.name)) {
    throw new Error("SKILL_NAME_ALREADY_EXISTS");
  }

  const skill: Skill = {
    skillId: crypto.randomUUID(),
    userId,
    name: input.name,
    category: input.category,
  };

  skills.push(skill);
  return skill;
};

export const createProject = (
  userId: string,
  input: {
    title: string;
    description?: string;
    repoURL?: string;
    status?: "In Progress" | "Completed" | "On Hold";
    isActive?: boolean;
    skillIds?: string[];
  },
) => {
  const project: Project = {
    projectId: crypto.randomUUID(),
    userId,
    title: input.title,
    description: input.description,
    repoURL: input.repoURL,
    isActive: input.isActive ?? true,
    status: projectStatusSchema.parse(input.status ?? "Completed"),
    skillIds: input.skillIds ?? [],
    createdAt: new Date().toISOString(),
  };

  projects.push(project);
  return project;
};

export const createExperience = (
  userId: string,
  input: {
    organization: string;
    role: string;
    description?: string;
    achievement?: string;
    startDate?: string;
    endDate?: string;
    skillIds?: string[];
  },
) => {
  const startDate = toIsoDate(input.startDate);
  const endDate = toIsoDate(input.endDate);

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const experience: Experience = {
    experienceId: crypto.randomUUID(),
    userId,
    organization: input.organization,
    role: input.role,
    description: input.description,
    achievement: input.achievement,
    startDate,
    endDate,
    skillIds: input.skillIds ?? [],
  };

  experiences.push(experience);
  return experience;
};

export const createResume = (
  userId: string,
  input: {
    versionName: string;
    targetJobTitle?: string;
    targetCompany?: string;
  },
) => {
  const now = new Date().toISOString();

  const resume: Resume = {
    resumeId: crypto.randomUUID(),
    userId,
    versionName: input.versionName,
    targetJobTitle: input.targetJobTitle,
    targetCompany: input.targetCompany,
    isActive: false,
    status: "Draft",
    projectIds: [],
    skillIds: [],
    experienceIds: [],
    createdAt: now,
    updatedAt: now,
  };

  resumes.push(resume);
  return resume;
};

export const updateResumeComposition = (
  userId: string,
  resumeId: string,
  payload: {
    projectIds: string[];
    skillIds: string[];
    experienceIds: string[];
  },
) => {
  const resume = resumes.find((item) => item.userId === userId && item.resumeId === resumeId);

  if (!resume) {
    return null;
  }

  resume.projectIds = payload.projectIds;
  resume.skillIds = payload.skillIds;
  resume.experienceIds = payload.experienceIds;
  resume.updatedAt = new Date().toISOString();

  return resume;
};

export const getResumeById = (userId: string, resumeId: string) =>
  resumes.find((item) => item.userId === userId && item.resumeId === resumeId) ?? null;

export const getProjectByIds = (userId: string, ids: string[]) =>
  projects.filter((item) => item.userId === userId && ids.includes(item.projectId));

export const getSkillByIds = (userId: string, ids: string[]) =>
  skills.filter((item) => item.userId === userId && ids.includes(item.skillId));

export const getExperienceByIds = (userId: string, ids: string[]) =>
  experiences.filter((item) => item.userId === userId && ids.includes(item.experienceId));

export const summarize = (userId: string) => {
  const userProjects = listProjects(userId);
  const userSkills = listSkills(userId);
  const userExperiences = listExperiences(userId);
  const userResumes = getResumeList(userId);

  return {
    counts: {
      projects: userProjects.length,
      skills: userSkills.length,
      experiences: userExperiences.length,
      resumes: userResumes.length,
    },
    activeResume: userResumes.find((item) => item.isActive) ?? null,
  };
};
