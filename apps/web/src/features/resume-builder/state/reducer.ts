import {
  cloneResumeConfig,
  cloneSavedResume,
  cloneVaultData,
  createInitialAiState,
  createInitialEditorState,
  createInitialNewProjectDraft,
} from "./initial-state";
import type {
  ResumeBuilderAction,
  ResumeBuilderState,
} from "./resume-builder.types";

const toggleIdInList = <TId extends string>(items: TId[], id: TId) => {
  if (items.includes(id)) {
    return items.filter((item) => item !== id);
  }

  return [...items, id];
};

export const resumeBuilderReducer = (
  state: ResumeBuilderState,
  action: ResumeBuilderAction,
): ResumeBuilderState => {
  switch (action.type) {
    case "data/hydrateSnapshot":
      return {
        ...state,
        db: cloneVaultData(action.payload.snapshot.vault),
        savedResumes: action.payload.snapshot.savedResumes.map(cloneSavedResume),
      };

    case "editor/startManualCreate":
      return {
        ...state,
        editor: createInitialEditorState(),
        ui: {
          ...state.ui,
          previewModal: { kind: "closed" },
        },
      };

    case "editor/loadResumeForEdit": {
      const resume = state.savedResumes.find(
        (item) => item.id === action.payload.resumeId,
      );

      if (!resume) {
        return state;
      }

      return {
        ...state,
        editor: {
          ...createInitialEditorState(),
          mode: "edit",
          editingResumeId: resume.id,
          resumeConfig: cloneResumeConfig(resume.config),
        },
        ui: {
          ...state.ui,
          previewModal: { kind: "closed" },
        },
      };
    }

    case "editor/setTargetRole":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            targetRole: action.payload.value,
          },
        },
      };

    case "editor/setTargetCompany":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            targetCompany: action.payload.value,
          },
        },
      };

    case "editor/setSummary":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            summary: action.payload.value,
          },
        },
      };

    case "editor/toggleSkill":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedSkills: toggleIdInList(
              state.editor.resumeConfig.selectedSkills,
              action.payload.skillId,
            ),
          },
        },
      };

    case "editor/toggleProject":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedProjects: toggleIdInList(
              state.editor.resumeConfig.selectedProjects,
              action.payload.projectId,
            ),
          },
        },
      };

    case "editor/toggleExperience":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedExperience: toggleIdInList(
              state.editor.resumeConfig.selectedExperience,
              action.payload.experienceId,
            ),
          },
        },
      };

    case "editor/toggleCertificate":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedCerts: toggleIdInList(
              state.editor.resumeConfig.selectedCerts,
              action.payload.certificateId,
            ),
          },
        },
      };

    case "editor/toggleAward":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedAwards: toggleIdInList(
              state.editor.resumeConfig.selectedAwards,
              action.payload.awardId,
            ),
          },
        },
      };

    case "editor/setNewSkill":
      return {
        ...state,
        editor: {
          ...state.editor,
          newSkill: action.payload.value,
        },
      };

    case "editor/addSkillToVault":
      return {
        ...state,
        db: {
          ...state.db,
          skills: [
            ...state.db.skills,
            {
              id: action.payload.skillId,
              name: action.payload.skillName.trim(),
              category: "custom",
            },
          ],
        },
        editor: {
          ...state.editor,
          newSkill: "",
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedSkills: [
              ...state.editor.resumeConfig.selectedSkills,
              action.payload.skillId,
            ],
          },
        },
      };

    case "editor/setProjectFormOpen":
      return {
        ...state,
        editor: {
          ...state.editor,
          showProjectForm: action.payload.open,
        },
      };

    case "editor/setNewProject":
      return {
        ...state,
        editor: {
          ...state.editor,
          newProject: { ...action.payload.draft },
        },
      };

    case "editor/addProjectToVault":
      return {
        ...state,
        db: {
          ...state.db,
          projects: [
            ...state.db.projects,
            {
              id: action.payload.projectId,
              ...action.payload.draft,
            },
          ],
        },
        editor: {
          ...state.editor,
          showProjectForm: false,
          newProject: createInitialNewProjectDraft(),
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedProjects: [
              ...state.editor.resumeConfig.selectedProjects,
              action.payload.projectId,
            ],
          },
        },
      };

    case "resume/upsert": {
      const nextResume = cloneSavedResume(action.payload.resume);
      const currentIndex = state.savedResumes.findIndex(
        (item) => item.id === nextResume.id,
      );
      const nextSavedResumes =
        currentIndex >= 0
          ? state.savedResumes.map((resume, index) =>
              index === currentIndex ? nextResume : resume,
            )
          : [nextResume, ...state.savedResumes];

      return {
        ...state,
        savedResumes: nextSavedResumes,
        editor: createInitialEditorState(),
        ai: createInitialAiState(),
        ui: {
          ...state.ui,
          previewModal: { kind: "closed" },
        },
      };
    }

    case "resume/delete": {
      const nextSavedResumes = state.savedResumes.filter(
        (resume) => resume.id !== action.payload.resumeId,
      );
      const shouldResetEditor =
        state.editor.editingResumeId === action.payload.resumeId;
      const shouldClosePreview =
        state.ui.previewModal.kind === "open" &&
        state.ui.previewModal.resume.id === action.payload.resumeId;

      return {
        ...state,
        savedResumes: nextSavedResumes,
        editor: shouldResetEditor ? createInitialEditorState() : state.editor,
        ui: {
          ...state.ui,
          previewModal: shouldClosePreview
            ? { kind: "closed" }
            : state.ui.previewModal,
        },
      };
    }

    case "resume/duplicate":
      return {
        ...state,
        savedResumes: [
          cloneSavedResume(action.payload.duplicatedResume),
          ...state.savedResumes,
        ],
      };

    case "resume/updateStatus": {
      const nextSavedResumes = state.savedResumes.map((resume) =>
        resume.id === action.payload.resumeId
          ? { ...resume, status: action.payload.status }
          : resume,
      );

      const nextPreviewModal =
        state.ui.previewModal.kind === "open" &&
        state.ui.previewModal.resume.id === action.payload.resumeId
          ? {
              kind: "open" as const,
              resume: {
                ...state.ui.previewModal.resume,
                status: action.payload.status,
              },
            }
          : state.ui.previewModal;

      return {
        ...state,
        savedResumes: nextSavedResumes,
        ui: {
          ...state.ui,
          previewModal: nextPreviewModal,
        },
      };
    }

    case "ai/reset":
      return {
        ...state,
        ai: createInitialAiState(),
      };

    case "ai/setJobDescription":
      return {
        ...state,
        ai: {
          ...state.ai,
          jobDescription: action.payload.value,
        },
      };

    case "ai/startAnalysis":
      return {
        ...state,
        ai: {
          ...state.ai,
          analysisState: "analyzing",
        },
      };

    case "ai/completeAnalysis":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: cloneResumeConfig(action.payload.suggestedConfig),
        },
        ai: {
          ...state.ai,
          analysisState: "done",
          feedback: {
            matchScore: action.payload.feedback.matchScore,
            missingSkills: [...action.payload.feedback.missingSkills],
          },
        },
      };

    case "ai/fixMissingSkill":
      return {
        ...state,
        db: {
          ...state.db,
          skills: [
            ...state.db.skills,
            {
              id: action.payload.skillId,
              name: action.payload.skillName.trim(),
              category: "custom",
            },
          ],
        },
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedSkills: [
              ...state.editor.resumeConfig.selectedSkills,
              action.payload.skillId,
            ],
          },
        },
        ai: {
          ...state.ai,
          feedback: {
            matchScore: Math.min(100, state.ai.feedback.matchScore + 10),
            missingSkills: state.ai.feedback.missingSkills.filter(
              (skill) => skill !== action.payload.skillName,
            ),
          },
        },
      };

    case "ui/showToast":
      return {
        ...state,
        ui: {
          ...state.ui,
          toastMessage: action.payload.message,
        },
      };

    case "ui/clearToast":
      return {
        ...state,
        ui: {
          ...state.ui,
          toastMessage: null,
        },
      };

    case "ui/openPreview":
      return {
        ...state,
        ui: {
          ...state.ui,
          previewModal: {
            kind: "open",
            resume: cloneSavedResume(action.payload.resume),
          },
        },
      };

    case "ui/closePreview":
      return {
        ...state,
        ui: {
          ...state.ui,
          previewModal: { kind: "closed" },
        },
      };

    default:
      return state;
  }
};
