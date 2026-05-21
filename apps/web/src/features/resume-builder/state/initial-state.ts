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
  selectedSkills: [...config.selectedSkills],
  selectedProjects: [...config.selectedProjects],
  selectedExperience: [...config.selectedExperience],
  selectedCerts: [...config.selectedCerts],
  selectedAwards: [...config.selectedAwards],
});

export const cloneSavedResume = (resume: SavedResume): SavedResume => ({
  ...resume,
  config: cloneResumeConfig(resume.config),
});

export const cloneVaultData = (db: VaultData): VaultData => ({
  basicInfo: { ...db.basicInfo },
  skills: db.skills.map((skill) => ({ ...skill })),
  projects: db.projects.map((project) => ({ ...project })),
  experience: db.experience.map((experience) => ({ ...experience })),
  certificates: db.certificates.map((certificate) => ({ ...certificate })),
  awards: db.awards.map((award) => ({ ...award })),
});

export const createInitialNewProjectDraft = () => ({
  title: "",
  role: "",
  description: "",
});

export const createInitialEditorState = (): ResumeBuilderEditorState => ({
  mode: "create",
  editingResumeId: null,
  resumeConfig: cloneResumeConfig(EMPTY_RESUME_CONFIG),
  newSkill: "",
  showProjectForm: false,
  newProject: createInitialNewProjectDraft(),
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
});

export const initialResumeBuilderState = createInitialResumeBuilderState();
