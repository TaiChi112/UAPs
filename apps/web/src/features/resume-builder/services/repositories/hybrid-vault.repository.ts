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
      role: project.role.trim() || fallbackProject.role,
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
      github: apiVault.basicInfo.github || fallbackVault.basicInfo.github,
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
    const fallbackSnapshot = await this.fallbackRepository.loadSnapshot();

    try {
      const apiSnapshot = await this.apiRepository.loadSnapshot();

      return {
        source: "hybrid",
        vault: mergeVaultData(
          cloneVaultData(apiSnapshot.vault),
          cloneVaultData(fallbackSnapshot.vault),
        ),
        savedResumes: mergeSavedResumes(
          apiSnapshot.savedResumes,
          fallbackSnapshot.savedResumes,
        ),
      };
    } catch {
      return cloneSnapshot(fallbackSnapshot);
    }
  }

  async createSkill(input: CreateSkillInput): Promise<VaultSkill> {
    try {
      return await this.apiRepository.createSkill(input);
    } catch {
      return this.fallbackRepository.createSkill(input);
    }
  }

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    try {
      return await this.apiRepository.createProject(input);
    } catch {
      return this.fallbackRepository.createProject(input);
    }
  }

  async saveResume(input: UpsertSavedResumeInput): Promise<SavedResume> {
    try {
      const apiSavedResume = await this.apiRepository.saveResume(input);
      const fallbackSnapshot = await this.fallbackRepository.loadSnapshot();
      const fallbackResume = fallbackSnapshot.savedResumes.find(
        (resume) => resume.id === apiSavedResume.id,
      );

      if (!fallbackResume) {
        return apiSavedResume;
      }

      return {
        ...apiSavedResume,
        config: {
          ...apiSavedResume.config,
          summary: apiSavedResume.config.summary || fallbackResume.config.summary,
          selectedCerts: [...apiSavedResume.config.selectedCerts],
          selectedAwards: [...apiSavedResume.config.selectedAwards],
        },
      };
    } catch {
      return this.fallbackRepository.saveResume(input);
    }
  }

  async duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    try {
      return await this.apiRepository.duplicateResume(resumeId, duplicatedAt);
    } catch {
      return this.fallbackRepository.duplicateResume(resumeId, duplicatedAt);
    }
  }

  async deleteResume(resumeId: ResumeId): Promise<boolean> {
    try {
      return await this.apiRepository.deleteResume(resumeId);
    } catch {
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

      const fallbackSnapshot = await this.fallbackRepository.loadSnapshot();
      const fallbackResume = fallbackSnapshot.savedResumes.find(
        (resume) => resume.id === updatedResume.id,
      );

      if (!fallbackResume) {
        return updatedResume;
      }

      return {
        ...updatedResume,
        config: {
          ...updatedResume.config,
          summary: updatedResume.config.summary || fallbackResume.config.summary,
          selectedCerts: [...updatedResume.config.selectedCerts],
          selectedAwards: [...updatedResume.config.selectedAwards],
        },
      };
    } catch {
      return this.fallbackRepository.updateResumeStatus(resumeId, status);
    }
  }
}
