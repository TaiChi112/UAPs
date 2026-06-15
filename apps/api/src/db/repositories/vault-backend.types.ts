import type {
  CreateSkillInput,
  FeatureResumeStatus,
  NewAwardDraft,
  NewCertificateDraft,
  NewExperienceDraft,
  NewProjectDraft,
  ResumeBuilderSnapshot,
  ResumeId,
  SavedResume,
  UpsertSavedResumeInput,
  VaultData,
  VaultProject,
  VaultSkill,
  VaultExperience,
  VaultCertificate,
  VaultAward,
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
  updateProject(
    userId: VaultBackendUserId,
    projectId: string,
    input: NewProjectDraft,
  ): Promise<VaultProject>;
  deleteProject(
    userId: VaultBackendUserId,
    projectId: string,
  ): Promise<boolean>;

  createExperience(
    userId: VaultBackendUserId,
    input: NewExperienceDraft,
  ): Promise<VaultExperience>;
  updateExperience(
    userId: VaultBackendUserId,
    experienceId: string,
    input: NewExperienceDraft,
  ): Promise<VaultExperience>;
  deleteExperience(
    userId: VaultBackendUserId,
    experienceId: string,
  ): Promise<boolean>;

  createCertificate(
    userId: VaultBackendUserId,
    input: NewCertificateDraft,
  ): Promise<VaultCertificate>;
  updateCertificate(
    userId: VaultBackendUserId,
    certificateId: string,
    input: NewCertificateDraft,
  ): Promise<VaultCertificate>;
  deleteCertificate(
    userId: VaultBackendUserId,
    certificateId: string,
  ): Promise<boolean>;

  createAward(
    userId: VaultBackendUserId,
    input: NewAwardDraft,
  ): Promise<VaultAward>;
  updateAward(
    userId: VaultBackendUserId,
    awardId: string,
    input: NewAwardDraft,
  ): Promise<VaultAward>;
  deleteAward(
    userId: VaultBackendUserId,
    awardId: string,
  ): Promise<boolean>;

  updateSkill(
    userId: VaultBackendUserId,
    skillId: string,
    input: CreateSkillInput,
  ): Promise<VaultSkill>;
  deleteSkill(
    userId: VaultBackendUserId,
    skillId: string,
  ): Promise<boolean>;
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
