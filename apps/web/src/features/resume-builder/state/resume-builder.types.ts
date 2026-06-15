import type { Dispatch, ReactNode } from "react";

import type {
  AiAnalysisState,
  AiFeedback,
  AwardId,
  CertificateId,
  ExperienceId,
  NewProjectDraft,
  NewExperienceDraft,
  NewCertificateDraft,
  NewAwardDraft,
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
  showExperienceForm: boolean;
  newExperience: NewExperienceDraft;
  showCertificateForm: boolean;
  newCertificate: NewCertificateDraft;
  showAwardForm: boolean;
  newAward: NewAwardDraft;
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
  source?: "api" | "mock" | "hybrid";
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
  | { type: "editor/setSectionOrder"; payload: { order: string[] } }
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
  | {
      type: "editor/updateProjectInVault";
      payload: { projectId: ProjectId; draft: NewProjectDraft };
    }
  | {
      type: "editor/deleteProjectFromVault";
      payload: { projectId: ProjectId };
    }
  | { type: "editor/setExperienceFormOpen"; payload: { open: boolean } }
  | { type: "editor/setNewExperience"; payload: { draft: NewExperienceDraft } }
  | {
      type: "editor/addExperienceToVault";
      payload: { experienceId: ExperienceId; draft: NewExperienceDraft };
    }
  | {
      type: "editor/updateExperienceInVault";
      payload: { experienceId: ExperienceId; draft: NewExperienceDraft };
    }
  | {
      type: "editor/deleteExperienceFromVault";
      payload: { experienceId: ExperienceId };
    }
  | { type: "editor/setCertificateFormOpen"; payload: { open: boolean } }
  | { type: "editor/setNewCertificate"; payload: { draft: NewCertificateDraft } }
  | {
      type: "editor/addCertificateToVault";
      payload: { certificateId: CertificateId; draft: NewCertificateDraft };
    }
  | {
      type: "editor/updateCertificateInVault";
      payload: { certificateId: CertificateId; draft: NewCertificateDraft };
    }
  | {
      type: "editor/deleteCertificateFromVault";
      payload: { certificateId: CertificateId };
    }
  | { type: "editor/setAwardFormOpen"; payload: { open: boolean } }
  | { type: "editor/setNewAward"; payload: { draft: NewAwardDraft } }
  | {
      type: "editor/addAwardToVault";
      payload: { awardId: AwardId; draft: NewAwardDraft };
    }
  | {
      type: "editor/updateAwardInVault";
      payload: { awardId: AwardId; draft: NewAwardDraft };
    }
  | {
      type: "editor/deleteAwardFromVault";
      payload: { awardId: AwardId };
    }
  | {
      type: "editor/updateSkillInVault";
      payload: { skillId: SkillId; skillName: string };
    }
  | {
      type: "editor/deleteSkillFromVault";
      payload: { skillId: SkillId };
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
  | {
      type: "resume/updateVisibility";
      payload: { resumeId: ResumeId; visibility: string };
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
