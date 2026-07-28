import type {
  CreateSkillInput,
  FeatureResumeStatus,
  NewProjectDraft,
  ResumeBuilderSnapshot,
  ResumeId,
  SavedResume,
  UpsertSavedResumeInput,
  VaultData,
  VaultProject,
  VaultRepository,
  VaultSkill,
  ProjectId,
  SkillId,
} from "@uaps/shared/resume-builder";

import { ApiVaultRepository } from "./api-vault.repository";
import { MockVaultRepository } from "./mock-vault.repository";
import { cloneSavedResume, cloneSnapshot, cloneVaultData } from "./repository.utils";

export interface HybridVaultRepositoryOptions {
  apiRepository?: VaultRepository;
  fallbackRepository?: VaultRepository;
}

const dedupeByKey = <TItem>(
  items: readonly TItem[],
  buildKey: (item: TItem) => string,
) => {
  const seenKeys = new Set<string>();
  const nextItems: TItem[] = [];

  for (const item of items) {
    const itemKey = buildKey(item);

    if (seenKeys.has(itemKey)) {
      continue;
    }

    seenKeys.add(itemKey);
    nextItems.push(item);
  }

  return nextItems;
};

const mergeVaultData = (apiVault: VaultData, fallbackVault: VaultData): VaultData => {
  const fallbackProjectsById = new Map(
    fallbackVault.projects.map((project) => [project.id, project] as const),
  );
  const fallbackSkillsById = new Map(
    fallbackVault.skills.map((skill) => [skill.id, skill] as const),
  );
  const fallbackExperiencesById = new Map(
    fallbackVault.experience.map((experience) => [experience.id, experience] as const),
  );
  const apiSkillsWithFallbackCategories = apiVault.skills.map((skill) => {
    const fallbackSkill = fallbackSkillsById.get(skill.id);

    return fallbackSkill?.category && skill.category.length === 0
      ? { ...skill, category: fallbackSkill.category }
      : skill;
  });
  const apiProjectsWithFallbackRole = apiVault.projects.map((project) => {
    const fallbackProject = fallbackProjectsById.get(project.id);

    if (!fallbackProject) {
      return project;
    }

    return {
      ...project,
      description: project.description || fallbackProject.description,
    };
  });
  const apiExperiencesWithFallbackResponsibilities = apiVault.experience.map(
    (experience) => {
      const fallbackExperience = fallbackExperiencesById.get(experience.id);

      if (!fallbackExperience) {
        return experience;
      }

      return {
        ...experience,
        responsibilities:
          experience.responsibilities || fallbackExperience.responsibilities,
        duration: experience.duration || fallbackExperience.duration,
      };
    },
  );

  return {
    basicInfo: {
      name: apiVault.basicInfo.name || fallbackVault.basicInfo.name,
      email: apiVault.basicInfo.email || fallbackVault.basicInfo.email,
      phone: apiVault.basicInfo.phone || fallbackVault.basicInfo.phone,
      linkedin: apiVault.basicInfo.linkedin || fallbackVault.basicInfo.linkedin,
    },
    skills: dedupeByKey(apiSkillsWithFallbackCategories, (skill) =>
      String(skill.id),
    ),
    projects: dedupeByKey(apiProjectsWithFallbackRole, (project) =>
      String(project.id),
    ),
    experience: dedupeByKey(
      apiExperiencesWithFallbackResponsibilities,
      (experience) => String(experience.id),
    ),
    certificates:
      apiVault.certificates.length > 0
        ? apiVault.certificates.map((certificate) => ({
            ...certificate,
          }))
        : fallbackVault.certificates.map((certificate) => ({
            ...certificate,
          })),
    awards:
      apiVault.awards.length > 0
        ? apiVault.awards.map((award) => ({
            ...award,
          }))
        : fallbackVault.awards.map((award) => ({ ...award })),
  };
};

const mergeSavedResumes = (
  apiResumes: readonly SavedResume[],
  fallbackResumes: readonly SavedResume[],
): SavedResume[] => {
  const fallbackResumesById = new Map(
    fallbackResumes.map((resume) => [resume.id, resume] as const),
  );
  const mergedApiResumes = apiResumes.map((resume) => {
    const fallbackResume = fallbackResumesById.get(resume.id);

    if (!fallbackResume) {
      return cloneSavedResume(resume);
    }

      return {
        ...cloneSavedResume(resume),
        config: {
          ...resume.config,
          summary: resume.config.summary || fallbackResume.config.summary,
          selectedCerts: [...resume.config.selectedCerts],
          selectedAwards: [...resume.config.selectedAwards],
        },
      };
  });

  return dedupeByKey(
    mergedApiResumes,
    (resume) => String(resume.id),
  );
};

export class HybridVaultRepository implements VaultRepository {
  private readonly apiRepository: VaultRepository;
  private readonly fallbackRepository: VaultRepository;

  constructor(options: HybridVaultRepositoryOptions = {}) {
    this.apiRepository = options.apiRepository ?? new ApiVaultRepository();
    this.fallbackRepository = options.fallbackRepository ?? new MockVaultRepository();
  }

  async loadSnapshot(): Promise<ResumeBuilderSnapshot> {
    try {
      const apiSnapshot = await this.apiRepository.loadSnapshot();
      return {
        source: "api",
        vault: cloneVaultData(apiSnapshot.vault),
        savedResumes: apiSnapshot.savedResumes.map(cloneSavedResume),
      };
    } catch (error) {
      console.warn("UAPS: Failed to load from API/Database. Falling back to Mock data.", error);
      const fallbackSnapshot = await this.fallbackRepository.loadSnapshot();
      return {
        ...cloneSnapshot(fallbackSnapshot),
        source: "mock",
      };
    }
  }

  async createSkill(input: CreateSkillInput): Promise<VaultSkill> {
    try {
      return await this.apiRepository.createSkill(input);
    } catch (error) {
      console.warn("UAPS: Failed to create skill on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.createSkill(input);
    }
  }

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    try {
      return await this.apiRepository.createProject(input);
    } catch (error) {
      console.warn("UAPS: Failed to create project on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.createProject(input);
    }
  }

  async updateProject(projectId: ProjectId, input: NewProjectDraft): Promise<VaultProject> {
    try {
      return await this.apiRepository.updateProject(projectId, input);
    } catch (error) {
      console.warn("UAPS: Failed to update project on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateProject(projectId, input);
    }
  }

  async deleteProject(projectId: ProjectId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteProject(projectId);
    } catch (error) {
      console.warn("UAPS: Failed to delete project on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.deleteProject(projectId);
    }
  }

  async updateSkill(skillId: SkillId, input: CreateSkillInput): Promise<VaultSkill> {
    try {
      return await this.apiRepository.updateSkill(skillId, input);
    } catch (error) {
      console.warn("UAPS: Failed to update skill on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateSkill(skillId, input);
    }
  }

  async deleteSkill(skillId: SkillId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteSkill(skillId);
    } catch (error) {
      console.warn("UAPS: Failed to delete skill on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.deleteSkill(skillId);
    }
  }

  async createExperience(input: import("@uaps/shared/resume-builder").NewExperienceDraft): Promise<import("@uaps/shared/resume-builder").VaultExperience> {
    try {
      return await this.apiRepository.createExperience(input);
    } catch (error) {
      console.warn("UAPS: Failed to create experience on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.createExperience(input);
    }
  }

  async updateExperience(id: import("@uaps/shared/resume-builder").ExperienceId, input: import("@uaps/shared/resume-builder").NewExperienceDraft): Promise<import("@uaps/shared/resume-builder").VaultExperience> {
    try {
      return await this.apiRepository.updateExperience(id, input);
    } catch (error) {
      console.warn("UAPS: Failed to update experience on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateExperience(id, input);
    }
  }

  async deleteExperience(id: import("@uaps/shared/resume-builder").ExperienceId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteExperience(id);
    } catch (error) {
      console.warn("UAPS: Failed to delete experience on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.deleteExperience(id);
    }
  }

  async createCertificate(input: import("@uaps/shared/resume-builder").NewCertificateDraft): Promise<import("@uaps/shared/resume-builder").VaultCertificate> {
    try {
      return await this.apiRepository.createCertificate(input);
    } catch (error) {
      console.warn("UAPS: Failed to create certificate on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.createCertificate(input);
    }
  }

  async updateCertificate(id: import("@uaps/shared/resume-builder").CertificateId, input: import("@uaps/shared/resume-builder").NewCertificateDraft): Promise<import("@uaps/shared/resume-builder").VaultCertificate> {
    try {
      return await this.apiRepository.updateCertificate(id, input);
    } catch (error) {
      console.warn("UAPS: Failed to update certificate on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateCertificate(id, input);
    }
  }

  async deleteCertificate(id: import("@uaps/shared/resume-builder").CertificateId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteCertificate(id);
    } catch (error) {
      console.warn("UAPS: Failed to delete certificate on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.deleteCertificate(id);
    }
  }

  async createAward(input: import("@uaps/shared/resume-builder").NewAwardDraft): Promise<import("@uaps/shared/resume-builder").VaultAward> {
    try {
      return await this.apiRepository.createAward(input);
    } catch (error) {
      console.warn("UAPS: Failed to create award on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.createAward(input);
    }
  }

  async updateAward(id: import("@uaps/shared/resume-builder").AwardId, input: import("@uaps/shared/resume-builder").NewAwardDraft): Promise<import("@uaps/shared/resume-builder").VaultAward> {
    try {
      return await this.apiRepository.updateAward(id, input);
    } catch (error) {
      console.warn("UAPS: Failed to update award on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateAward(id, input);
    }
  }

  async deleteAward(id: import("@uaps/shared/resume-builder").AwardId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteAward(id);
    } catch (error) {
      console.warn("UAPS: Failed to delete award on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.deleteAward(id);
    }
  }

  async saveResume(input: UpsertSavedResumeInput): Promise<SavedResume> {
    try {
      return await this.apiRepository.saveResume(input);
    } catch (error) {
      console.warn("UAPS: Failed to save resume on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.saveResume(input);
    }
  }

  async duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    try {
      return await this.apiRepository.duplicateResume(resumeId, duplicatedAt);
    } catch (error) {
      console.warn("UAPS: Failed to duplicate resume on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.duplicateResume(resumeId, duplicatedAt);
    }
  }

  async deleteResume(resumeId: ResumeId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteResume(resumeId);
    } catch (error) {
      console.warn("UAPS: Failed to delete resume on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.deleteResume(resumeId);
    }
  }

  async updateResumeStatus(
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    try {
      const updatedResume = await this.apiRepository.updateResumeStatus(
        resumeId,
        status,
      );
      if (!updatedResume) {
        return null;
      }
      return updatedResume;
    } catch (error) {
      console.warn("UAPS: Failed to update resume status on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateResumeStatus(resumeId, status);
    }
  }

  async updateResumeVisibility(
    resumeId: ResumeId,
    visibility: string,
  ): Promise<SavedResume | null> {
    try {
      const updatedResume = await this.apiRepository.updateResumeVisibility(
        resumeId,
        visibility,
      );
      if (!updatedResume) {
        return null;
      }
      return updatedResume;
    } catch (error) {
      console.warn("UAPS: Failed to update resume visibility on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.updateResumeVisibility(resumeId, visibility);
    }
  }

  async getPublicResumes(): Promise<SavedResume[]> {
    try {
      return await this.apiRepository.getPublicResumes();
    } catch (error) {
      console.warn("UAPS: Failed to get public resumes on API/Database. Falling back to Mock.", error);
      return this.fallbackRepository.getPublicResumes();
    }
  }
}

