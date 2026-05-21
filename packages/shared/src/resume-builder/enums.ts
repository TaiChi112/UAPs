export const BUILDER_VIEW_VALUES = [
  "dashboard",
  "builder_manual",
  "builder_ai",
] as const;

export type BuilderView = (typeof BUILDER_VIEW_VALUES)[number];

export const AI_ANALYSIS_STATE_VALUES = [
  "idle",
  "analyzing",
  "done",
] as const;

export type AiAnalysisState = (typeof AI_ANALYSIS_STATE_VALUES)[number];

export const FEATURE_RESUME_STATUS_VALUES = [
  "Draft",
  "Applied",
  "Interviewing",
] as const;

export type FeatureResumeStatus =
  (typeof FEATURE_RESUME_STATUS_VALUES)[number];

export const PERSISTED_RESUME_STATUS_VALUES = [
  "Draft",
  "Published",
  "Archived",
] as const;

export type PersistedResumeStatus =
  (typeof PERSISTED_RESUME_STATUS_VALUES)[number];

export const DEFAULT_SKILL_CATEGORY_VALUES = [
  "programming",
  "frameworks",
  "tools",
  "custom",
] as const;

export type DefaultSkillCategory =
  (typeof DEFAULT_SKILL_CATEGORY_VALUES)[number];

export type SkillCategory = DefaultSkillCategory | (string & {});
