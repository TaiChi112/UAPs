import {
  asProjectId,
  asResumeId,
  asSkillId,
  asExperienceId,
  asCertificateId,
  asAwardId,
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
  type ProjectId,
  type SkillId,
  type ExperienceId,
  type CertificateId,
  type AwardId,
  type NewExperienceDraft,
  type NewCertificateDraft,
  type NewAwardDraft,
  type VaultExperience,
  type VaultCertificate,
  type VaultAward,
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
      duration: `${input.startDate} - ${input.endDate}`,
      description: input.description.trim(),
      githubUrl: input.githubUrl?.trim() ?? "",
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
      visibility: "private",
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

  async updateProject(projectId: ProjectId, input: NewProjectDraft): Promise<VaultProject> {
    const snapshot = this.readSnapshot();
    const projectIndex = snapshot.vault.projects.findIndex((p) => p.id === projectId);
    
    if (projectIndex === -1) throw new Error("Project not found");

    const updatedProject: VaultProject = {
      ...snapshot.vault.projects[projectIndex],
      ...input,
      duration: `${input.startDate} - ${input.endDate}`,
      githubUrl: input.githubUrl?.trim() ?? "",
    };

    snapshot.vault.projects[projectIndex] = updatedProject;
    this.writeSnapshot(snapshot);
    return updatedProject;
  }

  async deleteProject(projectId: ProjectId): Promise<boolean> {
    const snapshot = this.readSnapshot();
    const prevLength = snapshot.vault.projects.length;
    snapshot.vault.projects = snapshot.vault.projects.filter((p) => p.id !== projectId);
    this.writeSnapshot(snapshot);
    return snapshot.vault.projects.length < prevLength;
  }

  async createExperience(input: NewExperienceDraft): Promise<VaultExperience> {
    const snapshot = this.readSnapshot();
    const exp: VaultExperience = {
      id: asExperienceId(`e-${this.now()}`),
      company: input.company.trim(),
      role: input.role.trim(),
      duration: `${input.startDate} - ${input.endDate}`,
      responsibilities: input.responsibilities.trim(),
    };
    snapshot.vault.experience.push(exp);
    this.writeSnapshot(snapshot);
    return { ...exp };
  }

  async updateExperience(id: ExperienceId, input: NewExperienceDraft): Promise<VaultExperience> {
    const snapshot = this.readSnapshot();
    const idx = snapshot.vault.experience.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Experience not found");
    const updated = {
      ...snapshot.vault.experience[idx],
      company: input.company.trim(),
      role: input.role.trim(),
      duration: `${input.startDate} - ${input.endDate}`,
      responsibilities: input.responsibilities.trim(),
    };
    snapshot.vault.experience[idx] = updated;
    this.writeSnapshot(snapshot);
    return updated;
  }

  async deleteExperience(id: ExperienceId): Promise<boolean> {
    const snapshot = this.readSnapshot();
    const prevLen = snapshot.vault.experience.length;
    snapshot.vault.experience = snapshot.vault.experience.filter((e) => e.id !== id);
    this.writeSnapshot(snapshot);
    return snapshot.vault.experience.length < prevLen;
  }

  async createCertificate(input: NewCertificateDraft): Promise<VaultCertificate> {
    const snapshot = this.readSnapshot();
    const cert: VaultCertificate = {
      id: asCertificateId(`c-${this.now()}`),
      name: input.name.trim(),
      year: input.year.trim(),
    };
    snapshot.vault.certificates.push(cert);
    this.writeSnapshot(snapshot);
    return { ...cert };
  }

  async updateCertificate(id: CertificateId, input: NewCertificateDraft): Promise<VaultCertificate> {
    const snapshot = this.readSnapshot();
    const idx = snapshot.vault.certificates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Certificate not found");
    const updated = {
      ...snapshot.vault.certificates[idx],
      name: input.name.trim(),
      year: input.year.trim(),
    };
    snapshot.vault.certificates[idx] = updated;
    this.writeSnapshot(snapshot);
    return updated;
  }

  async deleteCertificate(id: CertificateId): Promise<boolean> {
    const snapshot = this.readSnapshot();
    const prevLen = snapshot.vault.certificates.length;
    snapshot.vault.certificates = snapshot.vault.certificates.filter((c) => c.id !== id);
    this.writeSnapshot(snapshot);
    return snapshot.vault.certificates.length < prevLen;
  }

  async createAward(input: NewAwardDraft): Promise<VaultAward> {
    const snapshot = this.readSnapshot();
    const award: VaultAward = {
      id: asAwardId(`a-${this.now()}`),
      name: input.name.trim(),
      desc: input.desc.trim(),
    };
    snapshot.vault.awards.push(award);
    this.writeSnapshot(snapshot);
    return { ...award };
  }

  async updateAward(id: AwardId, input: NewAwardDraft): Promise<VaultAward> {
    const snapshot = this.readSnapshot();
    const idx = snapshot.vault.awards.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Award not found");
    const updated = {
      ...snapshot.vault.awards[idx],
      name: input.name.trim(),
      desc: input.desc.trim(),
    };
    snapshot.vault.awards[idx] = updated;
    this.writeSnapshot(snapshot);
    return updated;
  }

  async deleteAward(id: AwardId): Promise<boolean> {
    const snapshot = this.readSnapshot();
    const prevLen = snapshot.vault.awards.length;
    snapshot.vault.awards = snapshot.vault.awards.filter((a) => a.id !== id);
    this.writeSnapshot(snapshot);
    return snapshot.vault.awards.length < prevLen;
  }

  async updateSkill(skillId: SkillId, input: CreateSkillInput): Promise<VaultSkill> {
    const snapshot = this.readSnapshot();
    const skillIndex = snapshot.vault.skills.findIndex((s) => s.id === skillId);
    
    if (skillIndex === -1) throw new Error("Skill not found");

    const updatedSkill: VaultSkill = {
      ...snapshot.vault.skills[skillIndex],
      ...input,
    };

    snapshot.vault.skills[skillIndex] = updatedSkill;
    this.writeSnapshot(snapshot);
    return updatedSkill;
  }

  async deleteSkill(skillId: SkillId): Promise<boolean> {
    const snapshot = this.readSnapshot();
    const prevLength = snapshot.vault.skills.length;
    snapshot.vault.skills = snapshot.vault.skills.filter((s) => s.id !== skillId);
    this.writeSnapshot(snapshot);
    return snapshot.vault.skills.length < prevLength;
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

  async updateResumeVisibility(
    resumeId: ResumeId,
    visibility: string,
  ): Promise<SavedResume | null> {
    const snapshot = this.readSnapshot();
    const resume = snapshot.savedResumes.find((item) => item.id === resumeId);

    if (!resume) {
      return null;
    }

    (resume as any).visibility = visibility;
    this.writeSnapshot(snapshot);

    return cloneSavedResume(resume);
  }

  async getPublicResumes(): Promise<SavedResume[]> {
    const snapshot = this.readSnapshot();
    return snapshot.savedResumes
      .filter((item) => (item as any).visibility === "public")
      .map(cloneSavedResume);
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
