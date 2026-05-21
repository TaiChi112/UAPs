import {
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type CreateSkillInput,
  type FeatureResumeStatus,
  type NewProjectDraft,
  type ResumeBuilderSnapshot,
  type ResumeId,
  type SavedResume,
  type UpsertSavedResumeInput,
  type VaultProject,
  type VaultRepository,
  type VaultSkill,
} from "@uaps/shared/resume-builder";

import {
  createProject,
  createResume,
  createSkill,
  deleteResumeById,
  getExperiences,
  getProjects,
  getResumes,
  getSkills,
  updateResumeById,
} from "@/lib/api";

import { createSeedSnapshot } from "./repository.utils";

const toFeatureStatus = (
  status: "Draft" | "Published" | "Archived",
): FeatureResumeStatus => {
  switch (status) {
    case "Published":
      return "Applied";
    case "Archived":
      return "Interviewing";
    default:
      return "Draft";
  }
};

const toPersistedStatus = (
  status: FeatureResumeStatus,
): "Draft" | "Published" | "Archived" => {
  switch (status) {
    case "Applied":
      return "Published";
    case "Interviewing":
      return "Archived";
    default:
      return "Draft";
  }
};

const formatApiDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export class ApiVaultRepository implements VaultRepository {
  async loadSnapshot(): Promise<ResumeBuilderSnapshot> {
    const [skills, projects, experiences, resumes] = await Promise.all([
      getSkills(),
      getProjects(),
      getExperiences(),
      getResumes(),
    ]);
    const seedSnapshot = createSeedSnapshot("api");

    return {
      source: "api",
      vault: {
        ...seedSnapshot.vault,
        skills: skills.map((skill) => ({
          id: asSkillId(skill.skillId),
          name: skill.name,
          category: skill.category,
        })),
        projects: projects.map((project) => ({
          id: asProjectId(project.projectId),
          title: project.title,
          role: project.status,
          description: project.description ?? "",
        })),
        experience: experiences.map((experience) => ({
          id: asExperienceId(experience.experienceId),
          company: experience.organization,
          role: experience.role,
          duration: [experience.startDate, experience.endDate]
            .filter(Boolean)
            .join(" - "),
          responsibilities:
            experience.achievement ?? experience.description ?? "",
        })),
      },
      savedResumes: resumes.map((resume) => ({
        id: asResumeId(resume.resumeId),
        title: resume.versionName,
        date: formatApiDate(resume.updatedAt),
        status: toFeatureStatus(resume.status),
        config: {
          targetRole: resume.targetJobTitle ?? "",
          targetCompany: resume.targetCompany ?? "",
          summary: "",
          selectedSkills: resume.skillIds.map((skillId) => asSkillId(skillId)),
          selectedProjects: resume.projectIds.map((projectId) =>
            asProjectId(projectId),
          ),
          selectedExperience: resume.experienceIds.map((experienceId) =>
            asExperienceId(experienceId),
          ),
          selectedCerts: [],
          selectedAwards: [],
        },
      })),
    };
  }

  async createSkill(input: CreateSkillInput): Promise<VaultSkill> {
    const result = await createSkill({
      name: input.name.trim(),
      category: input.category,
      proficiencyLevel: "Intermediate",
    });

    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to create skill");
    }

    return {
      id: asSkillId(result.data.skillId),
      name: result.data.name,
      category: result.data.category,
    };
  }

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    const result = await createProject({
      title: input.title.trim(),
      description: input.description.trim(),
      repoURL: undefined,
      status: "Completed",
      isActive: true,
      skillIds: [],
    });

    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to create project");
    }

    return {
      id: asProjectId(result.data.projectId),
      title: result.data.title,
      role: input.role.trim(),
      description: result.data.description ?? "",
    };
  }

  async saveResume(input: UpsertSavedResumeInput): Promise<SavedResume> {
    const payload = {
      versionName: input.title,
      targetJobTitle: input.config.targetRole || undefined,
      targetCompany: input.config.targetCompany || undefined,
      visibility: "private" as const,
      status: toPersistedStatus(input.status),
      isActive: true,
    };
    const result = input.resumeId
      ? await updateResumeById(input.resumeId, payload)
      : await createResume(payload);

    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to save resume");
    }

    return {
      id: asResumeId(result.data.resumeId),
      title: input.title,
      date: input.date,
      status: input.status,
      config: {
        ...input.config,
        selectedSkills: [...input.config.selectedSkills],
        selectedProjects: [...input.config.selectedProjects],
        selectedExperience: [...input.config.selectedExperience],
        selectedCerts: [...input.config.selectedCerts],
        selectedAwards: [...input.config.selectedAwards],
      },
    };
  }

  async duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    const snapshot = await this.loadSnapshot();
    const resume = snapshot.savedResumes.find((item) => item.id === resumeId);

    if (!resume) {
      return null;
    }

    return this.saveResume({
      title: `${resume.title} (Copy)`,
      date: duplicatedAt,
      status: "Draft",
      config: resume.config,
    });
  }

  async deleteResume(resumeId: ResumeId): Promise<boolean> {
    const result = await deleteResumeById(resumeId);
    return result.ok;
  }

  async updateResumeStatus(
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    const snapshot = await this.loadSnapshot();
    const resume = snapshot.savedResumes.find((item) => item.id === resumeId);

    if (!resume) {
      return null;
    }

    return this.saveResume({
      resumeId,
      title: resume.title,
      date: resume.date,
      status,
      config: resume.config,
    });
  }
}
