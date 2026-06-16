import type {
  ResumeBuilderAiState,
  ResumeBuilderEditorState,
  ResumeBuilderState,
  ResumeBuilderUiState,
} from "./resume-builder.types";

import type {
  ResumeConfig,
  SavedResume,
  VaultData,
} from "@uaps/shared/resume-builder";

import {
  EMPTY_RESUME_CONFIG,
  INITIAL_SAVED_RESUMES,
  INITIAL_VAULT_DATA,
} from "@/features/resume-builder/constants/mock-seed";

export const cloneResumeConfig = (config: ResumeConfig): ResumeConfig => ({
  ...config,
  selectedSkills: Array.from(new Set(config.selectedSkills)),
  selectedProjects: Array.from(new Set(config.selectedProjects)),
  selectedExperience: Array.from(new Set(config.selectedExperience)),
  selectedCerts: Array.from(new Set(config.selectedCerts)),
  selectedAwards: Array.from(new Set(config.selectedAwards)),
});

export const cloneSavedResume = (resume: SavedResume): SavedResume => ({
  ...resume,
  config: cloneResumeConfig(resume.config),
});

export const cloneVaultData = (db: VaultData): VaultData => ({
  basicInfo: { ...db.basicInfo },
  skills: Array.from(new Map(db.skills.map(s => [s.id, s])).values()).map((skill) => ({ ...skill })),
  projects: Array.from(new Map(db.projects.map(p => [p.id, p])).values()).map((project) => ({ ...project })),
  experience: Array.from(new Map(db.experience.map(e => [e.id, e])).values()).map((experience) => ({ ...experience })),
  certificates: Array.from(new Map(db.certificates.map(c => [c.id, c])).values()).map((certificate) => ({ ...certificate })),
  awards: Array.from(new Map(db.awards.map(a => [a.id, a])).values()).map((award) => ({ ...award })),
});

export const createInitialNewProjectDraft = () => ({
  title: "",
  startDate: "",
  endDate: "",
  description: "",
});

export const createInitialNewExperienceDraft = () => ({
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  responsibilities: "",
});

export const createInitialNewCertificateDraft = () => ({
  name: "",
  year: "",
});

export const createInitialNewAwardDraft = () => ({
  name: "",
  desc: "",
});

export const createInitialEditorState = (): ResumeBuilderEditorState => ({
  mode: "create",
  editingResumeId: null,
  resumeConfig: cloneResumeConfig(EMPTY_RESUME_CONFIG),
  newSkill: "",
  showProjectForm: false,
  newProject: createInitialNewProjectDraft(),
  showExperienceForm: false,
  newExperience: createInitialNewExperienceDraft(),
  showCertificateForm: false,
  newCertificate: createInitialNewCertificateDraft(),
  showAwardForm: false,
  newAward: createInitialNewAwardDraft(),
});

export const createInitialAiState = (): ResumeBuilderAiState => ({
  jobDescription: "",
  analysisState: "idle",
  feedback: {
    matchScore: 0,
    missingSkills: [],
  },
});

export const createInitialUiState = (): ResumeBuilderUiState => ({
  toastMessage: null,
  previewModal: { kind: "closed" },
});

export const createInitialResumeBuilderState = (): ResumeBuilderState => ({
  db: cloneVaultData(INITIAL_VAULT_DATA),
  savedResumes: INITIAL_SAVED_RESUMES.map(cloneSavedResume),
  editor: createInitialEditorState(),
  ai: createInitialAiState(),
  ui: createInitialUiState(),
  source: "mock",
});

export const initialResumeBuilderState = createInitialResumeBuilderState();
