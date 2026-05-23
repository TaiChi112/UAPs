import type { Dispatch, ReactNode } from "react";

import type {
  AiAnalysisState,
  AiFeedback,
  AwardId,
  CertificateId,
  ExperienceId,
  NewProjectDraft,
  PreviewModalState,
  ProjectId,
  ResumeBuilderSnapshot,
  ResumeConfig,
  ResumeId,
  SavedResume,
  SkillId,
  VaultData,
} from "@uaps/shared/resume-builder";

export type EditorMode = "create" | "edit";

export interface ResumeBuilderEditorState {
  mode: EditorMode;
  editingResumeId: ResumeId | null;
  resumeConfig: ResumeConfig;
  newSkill: string;
  showProjectForm: boolean;
  newProject: NewProjectDraft;
}

export interface ResumeBuilderAiState {
  jobDescription: string;
  analysisState: AiAnalysisState;
  feedback: AiFeedback;
}

export interface ResumeBuilderUiState {
  toastMessage: string | null;
  previewModal: PreviewModalState;
}

export interface ResumeBuilderState {
  db: VaultData;
  savedResumes: SavedResume[];
  editor: ResumeBuilderEditorState;
  ai: ResumeBuilderAiState;
  ui: ResumeBuilderUiState;
}

export type ResumeBuilderAction =
  | {
      type: "data/hydrateSnapshot";
      payload: { snapshot: ResumeBuilderSnapshot };
    }
  | { type: "editor/startManualCreate" }
  | { type: "editor/loadResumeForEdit"; payload: { resumeId: ResumeId } }
  | { type: "editor/setTargetRole"; payload: { value: string } }
  | { type: "editor/setTargetCompany"; payload: { value: string } }
  | { type: "editor/setSummary"; payload: { value: string } }
  | { type: "editor/toggleSkill"; payload: { skillId: SkillId } }
  | { type: "editor/toggleProject"; payload: { projectId: ProjectId } }
  | { type: "editor/toggleExperience"; payload: { experienceId: ExperienceId } }
  | { type: "editor/toggleCertificate"; payload: { certificateId: CertificateId } }
  | { type: "editor/toggleAward"; payload: { awardId: AwardId } }
  | { type: "editor/setNewSkill"; payload: { value: string } }
  | {
      type: "editor/addSkillToVault";
      payload: { skillId: SkillId; skillName: string };
    }
  | { type: "editor/setProjectFormOpen"; payload: { open: boolean } }
  | { type: "editor/setNewProject"; payload: { draft: NewProjectDraft } }
  | {
      type: "editor/addProjectToVault";
      payload: { projectId: ProjectId; draft: NewProjectDraft };
    }
  | { type: "resume/upsert"; payload: { resume: SavedResume } }
  | { type: "resume/delete"; payload: { resumeId: ResumeId } }
  | {
      type: "resume/duplicate";
      payload: { duplicatedResume: SavedResume };
    }
  | {
      type: "resume/updateStatus";
      payload: { resumeId: ResumeId; status: SavedResume["status"] };
    }
  | { type: "ai/reset" }
  | { type: "ai/setJobDescription"; payload: { value: string } }
  | { type: "ai/startAnalysis" }
  | { type: "ai/failAnalysis" }
  | {
      type: "ai/completeAnalysis";
      payload: { suggestedConfig: ResumeConfig; feedback: AiFeedback };
    }
  | {
      type: "ai/fixMissingSkill";
      payload: { skillId: SkillId; skillName: string };
    }
  | { type: "ui/showToast"; payload: { message: string } }
  | { type: "ui/clearToast" }
  | { type: "ui/openPreview"; payload: { resume: SavedResume } }
  | { type: "ui/closePreview" };

export interface ResumeBuilderContextValue {
  isHydrated: boolean;
  state: ResumeBuilderState;
  dispatch: Dispatch<ResumeBuilderAction>;
}

export interface ResumeBuilderProviderProps {
  children: ReactNode;
}
