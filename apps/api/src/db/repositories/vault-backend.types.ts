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
  VaultSkill,
} from "@uaps/shared/resume-builder";

export type VaultBackendUserId = string;

export type VaultBackendSnapshot = Pick<
  ResumeBuilderSnapshot,
  "vault" | "savedResumes"
>;

export interface IVaultBackendRepository {
  loadSnapshot(userId: VaultBackendUserId): Promise<VaultBackendSnapshot>;
  loadVaultData(userId: VaultBackendUserId): Promise<VaultData>;
  loadSavedResumes(userId: VaultBackendUserId): Promise<SavedResume[]>;
  getSavedResumeById(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
  ): Promise<SavedResume | null>;
  createSkill(
    userId: VaultBackendUserId,
    input: CreateSkillInput,
  ): Promise<VaultSkill>;
  createProject(
    userId: VaultBackendUserId,
    input: NewProjectDraft,
  ): Promise<VaultProject>;
  saveResume(
    userId: VaultBackendUserId,
    input: UpsertSavedResumeInput,
  ): Promise<SavedResume>;
  duplicateResume(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null>;
  deleteResume(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
  ): Promise<boolean>;
  updateResumeStatus(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null>;
}
