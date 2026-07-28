import type { FeatureResumeStatus, SkillCategory } from "./enums";
import type {
  NewAwardDraft,
  NewCertificateDraft,
  NewExperienceDraft,
  NewProjectDraft,
  ResumeConfig,
  ResumeId,
  SavedResume,
  VaultData,
  VaultProject,
  VaultSkill,
  VaultExperience,
  VaultCertificate,
  VaultAward,
  ProjectId,
  SkillId,
  ExperienceId,
  CertificateId,
  AwardId,
} from "./models";

export type RepositorySource = "mock" | "api" | "hybrid";

export type ResumeBuilderSnapshot = {
  source: RepositorySource;
  vault: VaultData;
  savedResumes: SavedResume[];
};

export type CreateSkillInput = {
  name: string;
  category: SkillCategory;
};

export type UpsertSavedResumeInput = {
  resumeId?: ResumeId;
  title: string;
  date: string;
  status: FeatureResumeStatus;
  visibility?: string;
  config: ResumeConfig;
};

export interface VaultRepository {
  loadSnapshot(): Promise<ResumeBuilderSnapshot>;
  createSkill(input: CreateSkillInput): Promise<VaultSkill>;
  createProject(input: NewProjectDraft): Promise<VaultProject>;
  updateProject(projectId: ProjectId, input: NewProjectDraft): Promise<VaultProject>;
  deleteProject(projectId: ProjectId): Promise<boolean>;
  updateSkill(skillId: SkillId, input: CreateSkillInput): Promise<VaultSkill>;
  deleteSkill(skillId: SkillId): Promise<boolean>;

  createExperience(input: NewExperienceDraft): Promise<VaultExperience>;
  updateExperience(experienceId: ExperienceId, input: NewExperienceDraft): Promise<VaultExperience>;
  deleteExperience(experienceId: ExperienceId): Promise<boolean>;

  createCertificate(input: NewCertificateDraft): Promise<VaultCertificate>;
  updateCertificate(certificateId: CertificateId, input: NewCertificateDraft): Promise<VaultCertificate>;
  deleteCertificate(certificateId: CertificateId): Promise<boolean>;

  createAward(input: NewAwardDraft): Promise<VaultAward>;
  updateAward(awardId: AwardId, input: NewAwardDraft): Promise<VaultAward>;
  deleteAward(awardId: AwardId): Promise<boolean>;
  saveResume(input: UpsertSavedResumeInput): Promise<SavedResume>;
  duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null>;
  deleteResume(resumeId: ResumeId): Promise<boolean>;
  updateResumeStatus(
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null>;
  updateResumeVisibility(
    resumeId: ResumeId,
    visibility: string,
  ): Promise<SavedResume | null>;
  getPublicResumes(): Promise<SavedResume[]>;
}
