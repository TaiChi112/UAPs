import {
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
  cloneSavedResume,
  cloneSnapshot,
  createSeedSnapshot,
  createStorageKey,
  normalizeSnapshot,
} from "./repository.utils";

export interface MockVaultRepositoryOptions {
  storage?: Storage | null;
  storageKey?: string;
  seedSnapshot?: ResumeBuilderSnapshot;
  now?: () => number;
}

const getBrowserStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export class MockVaultRepository implements VaultRepository {
  private readonly storage: Storage | null;
  private readonly storageKey: string;
  private readonly now: () => number;
  private memorySnapshot: ResumeBuilderSnapshot;

  constructor(options: MockVaultRepositoryOptions = {}) {
    this.storage = options.storage ?? getBrowserStorage();
    this.storageKey = options.storageKey ?? createStorageKey();
    this.now = options.now ?? Date.now;
    this.memorySnapshot = cloneSnapshot(
      options.seedSnapshot ?? createSeedSnapshot("mock"),
    );
  }

  async loadSnapshot(): Promise<ResumeBuilderSnapshot> {
    return this.readSnapshot();
  }

  async createSkill(input: CreateSkillInput): Promise<VaultSkill> {
    const snapshot = this.readSnapshot();
    const skill: VaultSkill = {
      id: asSkillId(`s-${this.now()}`),
      name: input.name.trim(),
      category: input.category,
    };

    snapshot.vault.skills.push(skill);
    this.writeSnapshot(snapshot);

    return { ...skill };
  }

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    const snapshot = this.readSnapshot();
    const project: VaultProject = {
      id: asProjectId(`p-${this.now()}`),
      title: input.title.trim(),
      role: input.role.trim(),
      description: input.description.trim(),
    };

    snapshot.vault.projects.push(project);
    this.writeSnapshot(snapshot);

    return { ...project };
  }

  async saveResume(input: UpsertSavedResumeInput): Promise<SavedResume> {
    const snapshot = this.readSnapshot();
    const resume: SavedResume = {
      id: input.resumeId ?? asResumeId(`res-${this.now()}`),
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
    const resumeIndex = snapshot.savedResumes.findIndex(
      (item) => item.id === resume.id,
    );

    if (resumeIndex >= 0) {
      snapshot.savedResumes[resumeIndex] = resume;
    } else {
      snapshot.savedResumes.unshift(resume);
    }

    this.writeSnapshot(snapshot);

    return cloneSavedResume(resume);
  }

  async duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    const snapshot = this.readSnapshot();
    const originalResume = snapshot.savedResumes.find(
      (resume) => resume.id === resumeId,
    );

    if (!originalResume) {
      return null;
    }

    const duplicatedResume: SavedResume = {
      ...cloneSavedResume(originalResume),
      id: asResumeId(`res-${this.now()}`),
      title: `${originalResume.title} (Copy)`,
      date: duplicatedAt,
      status: "Draft",
    };

    snapshot.savedResumes.unshift(duplicatedResume);
    this.writeSnapshot(snapshot);

    return cloneSavedResume(duplicatedResume);
  }

  async deleteResume(resumeId: ResumeId): Promise<boolean> {
    const snapshot = this.readSnapshot();
    const nextSavedResumes = snapshot.savedResumes.filter(
      (resume) => resume.id !== resumeId,
    );

    if (nextSavedResumes.length === snapshot.savedResumes.length) {
      return false;
    }

    snapshot.savedResumes = nextSavedResumes;
    this.writeSnapshot(snapshot);

    return true;
  }

  async updateResumeStatus(
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    const snapshot = this.readSnapshot();
    const resume = snapshot.savedResumes.find((item) => item.id === resumeId);

    if (!resume) {
      return null;
    }

    resume.status = status;
    this.writeSnapshot(snapshot);

    return cloneSavedResume(resume);
  }

  private readSnapshot(): ResumeBuilderSnapshot {
    const storedValue = this.storage?.getItem(this.storageKey);

    if (!storedValue) {
      return cloneSnapshot(this.memorySnapshot);
    }

    try {
      return cloneSnapshot(normalizeSnapshot(JSON.parse(storedValue), "mock"));
    } catch {
      return cloneSnapshot(this.memorySnapshot);
    }
  }

  private writeSnapshot(snapshot: ResumeBuilderSnapshot): void {
    this.memorySnapshot = cloneSnapshot({
      ...snapshot,
      source: "mock",
    });

    if (this.storage) {
      this.storage.setItem(this.storageKey, JSON.stringify(this.memorySnapshot));
    }
  }
}
