import type {
  CreateSkillInput,
  FeatureResumeStatus,
  NewProjectDraft,
  ResumeBuilderSnapshot,
  ResumeId,
  SavedResume,
  UpsertSavedResumeInput,
  VaultProject,
  VaultRepository,
  VaultSkill,
} from "@uaps/shared/resume-builder";

import { ApiVaultRepository } from "./api-vault.repository";
import { MockVaultRepository } from "./mock-vault.repository";
import { cloneSavedResume, cloneSnapshot } from "./repository.utils";

export interface HybridVaultRepositoryOptions {
  apiRepository?: VaultRepository;
  fallbackRepository?: VaultRepository;
}

const mergeByKey = <TItem>(
  primaryItems: TItem[],
  secondaryItems: TItem[],
  buildKey: (item: TItem) => string,
) => {
  const seenKeys = new Set(primaryItems.map(buildKey));
  const nextItems = [...primaryItems];

  for (const item of secondaryItems) {
    const itemKey = buildKey(item);

    if (seenKeys.has(itemKey)) {
      continue;
    }

    nextItems.push(item);
    seenKeys.add(itemKey);
  }

  return nextItems;
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
        vault: {
          basicInfo: { ...fallbackSnapshot.vault.basicInfo },
          skills: mergeByKey(
            fallbackSnapshot.vault.skills,
            apiSnapshot.vault.skills,
            (skill) => `${skill.name.toLowerCase()}::${skill.category.toLowerCase()}`,
          ),
          projects: mergeByKey(
            fallbackSnapshot.vault.projects,
            apiSnapshot.vault.projects,
            (project) =>
              `${project.title.toLowerCase()}::${project.description.toLowerCase()}`,
          ),
          experience: mergeByKey(
            fallbackSnapshot.vault.experience,
            apiSnapshot.vault.experience,
            (experience) =>
              `${experience.company.toLowerCase()}::${experience.role.toLowerCase()}::${experience.duration.toLowerCase()}`,
          ),
          certificates: [...fallbackSnapshot.vault.certificates],
          awards: [...fallbackSnapshot.vault.awards],
        },
        savedResumes: fallbackSnapshot.savedResumes.map(cloneSavedResume),
      };
    } catch {
      return cloneSnapshot(fallbackSnapshot);
    }
  }

  async createSkill(input: CreateSkillInput): Promise<VaultSkill> {
    const skill = await this.fallbackRepository.createSkill(input);

    try {
      await this.apiRepository.createSkill(input);
    } catch {
      return skill;
    }

    return skill;
  }

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    const project = await this.fallbackRepository.createProject(input);

    try {
      await this.apiRepository.createProject(input);
    } catch {
      return project;
    }

    return project;
  }

  async saveResume(input: UpsertSavedResumeInput): Promise<SavedResume> {
    return this.fallbackRepository.saveResume(input);
  }

  async duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    return this.fallbackRepository.duplicateResume(resumeId, duplicatedAt);
  }

  async deleteResume(resumeId: ResumeId): Promise<boolean> {
    return this.fallbackRepository.deleteResume(resumeId);
  }

  async updateResumeStatus(
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    return this.fallbackRepository.updateResumeStatus(resumeId, status);
  }
}
