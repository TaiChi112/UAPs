import type { FeatureResumeStatus, SkillCategory } from "./enums";
import type {
  NewProjectDraft,
  ResumeConfig,
  ResumeId,
  SavedResume,
  VaultData,
  VaultProject,
  VaultSkill,
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
  config: ResumeConfig;
};

export interface VaultRepository {
  loadSnapshot(): Promise<ResumeBuilderSnapshot>;
  createSkill(input: CreateSkillInput): Promise<VaultSkill>;
  createProject(input: NewProjectDraft): Promise<VaultProject>;
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
}
