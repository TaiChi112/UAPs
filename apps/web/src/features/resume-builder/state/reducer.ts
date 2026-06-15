import {
  cloneResumeConfig,
  cloneSavedResume,
  cloneVaultData,
  createInitialAiState,
  createInitialEditorState,
  createInitialNewProjectDraft,
  createInitialNewExperienceDraft,
  createInitialNewCertificateDraft,
  createInitialNewAwardDraft,
} from "./initial-state";
import type {
  ResumeBuilderAction,
  ResumeBuilderState,
} from "./resume-builder.types";
import type { SavedResume } from "@uaps/shared/resume-builder";

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
        source: action.payload.snapshot.source,
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

    case "editor/setSectionOrder":
      return {
        ...state,
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            sectionOrder: action.payload.order,
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

    case "editor/updateSkillInVault":
      return {
        ...state,
        db: {
          ...state.db,
          skills: state.db.skills.map(skill => 
            skill.id === action.payload.skillId ? { ...skill, name: action.payload.skillName.trim() } : skill
          ),
        },
      };

    case "editor/deleteSkillFromVault":
      return {
        ...state,
        db: {
          ...state.db,
          skills: state.db.skills.filter(skill => skill.id !== action.payload.skillId),
        },
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedSkills: state.editor.resumeConfig.selectedSkills.filter(id => id !== action.payload.skillId),
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
              duration: `${action.payload.draft.startDate} - ${action.payload.draft.endDate}`
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
    case "editor/updateProjectInVault":
      return {
        ...state,
        db: {
          ...state.db,
          projects: state.db.projects.map((project) =>
            project.id === action.payload.projectId
              ? {
                  ...project,
                  ...action.payload.draft,
                  duration: `${action.payload.draft.startDate} - ${action.payload.draft.endDate}`
                }
              : project,
          ),
        },
      };

    case "editor/deleteProjectFromVault":
      return {
        ...state,
        db: {
          ...state.db,
          projects: state.db.projects.filter(
            (project) => project.id !== action.payload.projectId,
          ),
        },
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedProjects: state.editor.resumeConfig.selectedProjects.filter(
              (id) => id !== action.payload.projectId,
            ),
          },
        },
      };

    case "editor/setExperienceFormOpen":
      return {
        ...state,
        editor: {
          ...state.editor,
          showExperienceForm: action.payload.open,
        },
      };

    case "editor/setNewExperience":
      return {
        ...state,
        editor: {
          ...state.editor,
          newExperience: { ...action.payload.draft },
        },
      };

    case "editor/addExperienceToVault":
      return {
        ...state,
        db: {
          ...state.db,
          experience: [
            ...state.db.experience,
            {
              id: action.payload.experienceId,
              ...action.payload.draft,
              duration: `${action.payload.draft.startDate} - ${action.payload.draft.endDate}`,
            },
          ],
        },
        editor: {
          ...state.editor,
          showExperienceForm: false,
          newExperience: createInitialNewExperienceDraft(),
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedExperience: [
              ...state.editor.resumeConfig.selectedExperience,
              action.payload.experienceId,
            ],
          },
        },
      };

    case "editor/updateExperienceInVault":
      return {
        ...state,
        db: {
          ...state.db,
          experience: state.db.experience.map((experience) =>
            experience.id === action.payload.experienceId
              ? {
                  ...experience,
                  ...action.payload.draft,
                  duration: `${action.payload.draft.startDate} - ${action.payload.draft.endDate}`,
                }
              : experience,
          ),
        },
      };

    case "editor/deleteExperienceFromVault":
      return {
        ...state,
        db: {
          ...state.db,
          experience: state.db.experience.filter(
            (experience) => experience.id !== action.payload.experienceId,
          ),
        },
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedExperience: state.editor.resumeConfig.selectedExperience.filter(
              (id) => id !== action.payload.experienceId,
            ),
          },
        },
      };

    case "editor/setCertificateFormOpen":
      return {
        ...state,
        editor: {
          ...state.editor,
          showCertificateForm: action.payload.open,
        },
      };

    case "editor/setNewCertificate":
      return {
        ...state,
        editor: {
          ...state.editor,
          newCertificate: { ...action.payload.draft },
        },
      };

    case "editor/addCertificateToVault":
      return {
        ...state,
        db: {
          ...state.db,
          certificates: [
            ...state.db.certificates,
            {
              id: action.payload.certificateId,
              ...action.payload.draft,
            },
          ],
        },
        editor: {
          ...state.editor,
          showCertificateForm: false,
          newCertificate: createInitialNewCertificateDraft(),
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedCerts: [
              ...state.editor.resumeConfig.selectedCerts,
              action.payload.certificateId,
            ],
          },
        },
      };

    case "editor/updateCertificateInVault":
      return {
        ...state,
        db: {
          ...state.db,
          certificates: state.db.certificates.map((certificate) =>
            certificate.id === action.payload.certificateId
              ? {
                  ...certificate,
                  ...action.payload.draft,
                }
              : certificate,
          ),
        },
      };

    case "editor/deleteCertificateFromVault":
      return {
        ...state,
        db: {
          ...state.db,
          certificates: state.db.certificates.filter(
            (certificate) => certificate.id !== action.payload.certificateId,
          ),
        },
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedCerts: state.editor.resumeConfig.selectedCerts.filter(
              (id) => id !== action.payload.certificateId,
            ),
          },
        },
      };

    case "editor/setAwardFormOpen":
      return {
        ...state,
        editor: {
          ...state.editor,
          showAwardForm: action.payload.open,
        },
      };

    case "editor/setNewAward":
      return {
        ...state,
        editor: {
          ...state.editor,
          newAward: { ...action.payload.draft },
        },
      };

    case "editor/addAwardToVault":
      return {
        ...state,
        db: {
          ...state.db,
          awards: [
            ...state.db.awards,
            {
              id: action.payload.awardId,
              ...action.payload.draft,
            },
          ],
        },
        editor: {
          ...state.editor,
          showAwardForm: false,
          newAward: createInitialNewAwardDraft(),
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedAwards: [
              ...state.editor.resumeConfig.selectedAwards,
              action.payload.awardId,
            ],
          },
        },
      };

    case "editor/updateAwardInVault":
      return {
        ...state,
        db: {
          ...state.db,
          awards: state.db.awards.map((award) =>
            award.id === action.payload.awardId
              ? {
                  ...award,
                  ...action.payload.draft,
                }
              : award,
          ),
        },
      };

    case "editor/deleteAwardFromVault":
      return {
        ...state,
        db: {
          ...state.db,
          awards: state.db.awards.filter(
            (award) => award.id !== action.payload.awardId,
          ),
        },
        editor: {
          ...state.editor,
          resumeConfig: {
            ...state.editor.resumeConfig,
            selectedAwards: state.editor.resumeConfig.selectedAwards.filter(
              (id) => id !== action.payload.awardId,
            ),
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

    case "resume/updateVisibility": {
      const nextSavedResumes = state.savedResumes.map((resume) =>
        resume.id === action.payload.resumeId
          ? { ...resume, visibility: action.payload.visibility } as any
          : resume,
      );

      const nextPreviewModal =
        state.ui.previewModal.kind === "open" &&
        state.ui.previewModal.resume.id === action.payload.resumeId
          ? {
              kind: "open" as const,
              resume: {
                ...state.ui.previewModal.resume,
                visibility: action.payload.visibility,
              } as any,
            }
          : state.ui.previewModal;

      return {
        ...state,
        savedResumes: nextSavedResumes as SavedResume[],
        ui: {
          ...state.ui,
          previewModal: nextPreviewModal as any,
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

    case "ai/failAnalysis":
      return {
        ...state,
        ai: {
          ...state.ai,
          analysisState: "idle",
          feedback: {
            matchScore: 0,
            missingSkills: [],
          },
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
