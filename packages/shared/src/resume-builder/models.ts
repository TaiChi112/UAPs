import type { FeatureResumeStatus, SkillCategory } from "./enums";

declare const brand: unique symbol;

type Brand<TValue, TBrand extends string> = TValue & {
  readonly [brand]: TBrand;
};

const toBrand = <TBrand extends string>(value: string): Brand<string, TBrand> =>
  value as Brand<string, TBrand>;

export type SkillId = Brand<string, "SkillId">;
export type ProjectId = Brand<string, "ProjectId">;
export type ExperienceId = Brand<string, "ExperienceId">;
export type CertificateId = Brand<string, "CertificateId">;
export type AwardId = Brand<string, "AwardId">;
export type ResumeId = Brand<string, "ResumeId">;

export const asSkillId = (value: string): SkillId => toBrand<"SkillId">(value);
export const asProjectId = (value: string): ProjectId =>
  toBrand<"ProjectId">(value);
export const asExperienceId = (value: string): ExperienceId =>
  toBrand<"ExperienceId">(value);
export const asCertificateId = (value: string): CertificateId =>
  toBrand<"CertificateId">(value);
export const asAwardId = (value: string): AwardId =>
  toBrand<"AwardId">(value);
export const asResumeId = (value: string): ResumeId =>
  toBrand<"ResumeId">(value);

export type BasicInfo = {
  name: string;
  email: string;
  phone: string;
  github: string;
};

export type VaultSkill = {
  id: SkillId;
  name: string;
  category: SkillCategory;
};

export type VaultProject = {
  id: ProjectId;
  title: string;
  duration: string;
  description: string;
  githubUrl?: string;
};

export type VaultExperience = {
  id: ExperienceId;
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
};

export type VaultCertificate = {
  id: CertificateId;
  name: string;
  year: string;
};

export type VaultAward = {
  id: AwardId;
  name: string;
  desc: string;
};

export type VaultData = {
  basicInfo: BasicInfo;
  skills: VaultSkill[];
  projects: VaultProject[];
  experience: VaultExperience[];
  certificates: VaultCertificate[];
  awards: VaultAward[];
};

export type ResumeConfig = {
  targetRole: string;
  targetCompany: string;
  summary: string;
  selectedSkills: SkillId[];
  selectedProjects: ProjectId[];
  selectedExperience: ExperienceId[];
  selectedCerts: CertificateId[];
  selectedAwards: AwardId[];
  sectionOrder: string[];
};

export type SavedResume = {
  id: ResumeId;
  title: string;
  date: string;
  status: FeatureResumeStatus;
  visibility: string;
  authorName?: string;
  authorAvatarUrl?: string;
  config: ResumeConfig;
  vaultData?: VaultData;
};

export type NewProjectDraft = {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  githubUrl?: string;
};

export type NewExperienceDraft = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
};

export type NewCertificateDraft = {
  name: string;
  year: string;
};

export type NewAwardDraft = {
  name: string;
  desc: string;
};

export type AiFeedback = {
  matchScore: number;
  missingSkills: string[];
};

export type ResumeConfigSelectionKey = keyof Pick<
  ResumeConfig,
  | "selectedSkills"
  | "selectedProjects"
  | "selectedExperience"
  | "selectedCerts"
  | "selectedAwards"
>;

export type PreviewModalState =
  | { kind: "closed" }
  | { kind: "open"; resume: SavedResume };
