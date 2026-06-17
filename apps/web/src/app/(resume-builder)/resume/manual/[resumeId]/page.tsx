"use client";

import type { FormEvent } from "react";
import { useEffect, useRef } from "react";

import type {
  AwardId,
  CertificateId,
  ExperienceId,
  ProjectId,
  SavedResume,
  SkillId,
} from "@uaps/shared/resume-builder";
import { asResumeId } from "@uaps/shared/resume-builder";
import { useParams, useRouter } from "next/navigation";

import { ManualBuilderView } from "@/features/resume-builder/components/manual/manual-builder-view";
import { useResumeBuilder } from "@/features/resume-builder/state/use-resume-builder";
import { useResumeBuilderActions } from "@/features/resume-builder/state/use-resume-builder-actions";

const buildResumeTitle = (
  resumeConfig: SavedResume["config"],
  savedResumeCount: number,
) => {
  if (resumeConfig.targetRole || resumeConfig.targetCompany) {
    return `${resumeConfig.targetRole || "Untitled"} ${resumeConfig.targetCompany ? `@ ${resumeConfig.targetCompany}` : ""}`;
  }

  return `Untitled Resume ${savedResumeCount + 1}`;
};

export default function ResumeBuilderEditResumePage() {
  const params = useParams<{ resumeId: string }>();
  const router = useRouter();
  const { isHydrated, state, dispatch } = useResumeBuilder();
  const actions = useResumeBuilderActions();

  const routeResumeId = asResumeId(params.resumeId);
  const savedResume = state.savedResumes.find(
    (resume) => resume.id === routeResumeId,
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!savedResume) {
      router.replace("/");
      return;
    }

    if (
      state.editor.mode !== "edit" ||
      state.editor.editingResumeId !== routeResumeId
    ) {
      dispatch({
        type: "editor/loadResumeForEdit",
        payload: { resumeId: routeResumeId },
      });
    }
  }, [
    dispatch,
    isHydrated,
    routeResumeId,
    router,
    savedResume,
    state.editor.editingResumeId,
    state.editor.mode,
  ]);

  const configRef = useRef(state.editor.resumeConfig);
  const savedResumeRef = useRef(savedResume);
  const actionsRef = useRef(actions);

  useEffect(() => {
    configRef.current = state.editor.resumeConfig;
    savedResumeRef.current = savedResume;
    actionsRef.current = actions;
  }, [state.editor.resumeConfig, savedResume, actions]);
  const handleCloseAndSaveForms = async () => {
    if (state.editor.showProjectForm) {
      if (state.editor.newProject.title.trim()) {
        await actions.addProjectToVault(state.editor.newProject);
      } else {
        dispatch({ type: "editor/setProjectFormOpen", payload: { open: false } });
      }
    }
    
    if (state.editor.showExperienceForm) {
      if (state.editor.newExperience.company.trim() || state.editor.newExperience.role.trim()) {
        await actions.addExperienceToVault(state.editor.newExperience);
      } else {
        dispatch({ type: "editor/setExperienceFormOpen", payload: { open: false } });
      }
    }
    
    if (state.editor.showCertificateForm) {
      if (state.editor.newCertificate.name.trim()) {
        await actions.addCertificateToVault(state.editor.newCertificate);
      } else {
        dispatch({ type: "editor/setCertificateFormOpen", payload: { open: false } });
      }
    }
    
    if (state.editor.showAwardForm) {
      if (state.editor.newAward.name.trim()) {
        await actions.addAwardToVault(state.editor.newAward);
      } else {
        dispatch({ type: "editor/setAwardFormOpen", payload: { open: false } });
      }
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not trigger if clicking inside any form or button
      if (target.closest('form') || target.closest('button')) {
        return;
      }
      
      // We must not await inside a synchronous event listener, but calling async function is fine
      void handleCloseAndSaveForms();
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [
    state.editor.showProjectForm,
    state.editor.showExperienceForm,
    state.editor.showCertificateForm,
    state.editor.showAwardForm,
    state.editor.newProject,
    state.editor.newExperience,
    state.editor.newCertificate,
    state.editor.newAward,
    actions,
    dispatch,
  ]);


  if (!isHydrated || !savedResume) {
    return null;
  }

  if (
    state.editor.mode !== "edit" ||
    state.editor.editingResumeId !== routeResumeId
  ) {
    return null;
  }

  const handleSave = async () => {
    await actions.saveResume({
      resumeId: savedResume.id,
      title: buildResumeTitle(
        state.editor.resumeConfig,
        state.savedResumes.length,
      ),
      date: savedResume.date,
      status: savedResume.status,
      config: state.editor.resumeConfig,
    });

    dispatch({
      type: "ui/showToast",
      payload: { message: "Resume updated successfully!" },
    });
    router.push("/vault");
  };

  const handleAddSkill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await actions.addSkillToVault(state.editor.newSkill);
  };


  const handleAddProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await actions.addProjectToVault(state.editor.newProject);
  };

  return (
    <ManualBuilderView
      isEditing={true}
      db={state.db}
      config={state.editor.resumeConfig}
      newSkill={state.editor.newSkill}
      showProjectForm={state.editor.showProjectForm}
      newProject={state.editor.newProject}
      onCancel={() => router.push("/vault")}
      onSave={handleSave}
      onTargetRoleChange={(value) =>
        dispatch({ type: "editor/setTargetRole", payload: { value } })
      }
      onTargetCompanyChange={(value) =>
        dispatch({ type: "editor/setTargetCompany", payload: { value } })
      }
      onSummaryChange={(value) =>
        dispatch({ type: "editor/setSummary", payload: { value } })
      }
      onToggleSkill={(skillId: SkillId) =>
        dispatch({ type: "editor/toggleSkill", payload: { skillId } })
      }
      onNewSkillChange={(value) =>
        dispatch({ type: "editor/setNewSkill", payload: { value } })
      }
      onAddSkill={handleAddSkill}
      onToggleProject={(projectId: ProjectId) =>
        dispatch({ type: "editor/toggleProject", payload: { projectId } })
      }
      onShowProjectForm={async () => {
        await handleCloseAndSaveForms();
        dispatch({
          type: "editor/setProjectFormOpen",
          payload: { open: true },
        });
      }}
      onHideProjectForm={() =>
        dispatch({
          type: "editor/setProjectFormOpen",
          payload: { open: false },
        })
      }
      onProjectDraftChange={(draft) =>
        dispatch({ type: "editor/setNewProject", payload: { draft } })
      }
      onAddProject={handleAddProject}
      showExperienceForm={state.editor.showExperienceForm}
      newExperience={state.editor.newExperience}
      onToggleExperience={(experienceId: ExperienceId) =>
        dispatch({
          type: "editor/toggleExperience",
          payload: { experienceId },
        })
      }
      onShowExperienceForm={async () => {
        await handleCloseAndSaveForms();
        dispatch({
          type: "editor/setExperienceFormOpen",
          payload: { open: true },
        });
      }}
      onHideExperienceForm={() =>
        dispatch({
          type: "editor/setExperienceFormOpen",
          payload: { open: false },
        })
      }
      onExperienceDraftChange={(draft) =>
        dispatch({ type: "editor/setNewExperience", payload: { draft } })
      }
      onAddExperience={async (event) => {
        event.preventDefault();
        await actions.addExperienceToVault(state.editor.newExperience);
      }}
      showCertificateForm={state.editor.showCertificateForm}
      newCertificate={state.editor.newCertificate}
      onToggleCert={(certificateId: CertificateId) =>
        dispatch({
          type: "editor/toggleCertificate",
          payload: { certificateId },
        })
      }
      onShowCertificateForm={async () => {
        await handleCloseAndSaveForms();
        dispatch({
          type: "editor/setCertificateFormOpen",
          payload: { open: true },
        });
      }}
      onHideCertificateForm={() =>
        dispatch({
          type: "editor/setCertificateFormOpen",
          payload: { open: false },
        })
      }
      onCertificateDraftChange={(draft) =>
        dispatch({ type: "editor/setNewCertificate", payload: { draft } })
      }
      onAddCertificate={async (event) => {
        event.preventDefault();
        await actions.addCertificateToVault(state.editor.newCertificate);
      }}
      showAwardForm={state.editor.showAwardForm}
      newAward={state.editor.newAward}
      onToggleAward={(awardId: AwardId) =>
        dispatch({ type: "editor/toggleAward", payload: { awardId } })
      }
      onShowAwardForm={async () => {
        await handleCloseAndSaveForms();
        dispatch({ type: "editor/setAwardFormOpen", payload: { open: true } });
      }}
      onHideAwardForm={() =>
        dispatch({ type: "editor/setAwardFormOpen", payload: { open: false } })
      }
      onAwardDraftChange={(draft) =>
        dispatch({ type: "editor/setNewAward", payload: { draft } })
      }
      onAddAward={async (event) => {
        event.preventDefault();
        await actions.addAwardToVault(state.editor.newAward);
      }}
      onSectionOrderChange={(order: string[]) =>
        dispatch({ type: "editor/setSectionOrder", payload: { order } })
      }
    />
  );
}
