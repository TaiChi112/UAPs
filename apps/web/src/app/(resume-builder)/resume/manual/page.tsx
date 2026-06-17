"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";

import type {
  AwardId,
  CertificateId,
  ExperienceId,
  ProjectId,
  SavedResume,
  SkillId,
} from "@uaps/shared/resume-builder";
import { useRouter } from "next/navigation";

import { ManualBuilderView } from "@/features/resume-builder/components/manual/manual-builder-view";
import { useResumeBuilder } from "@/features/resume-builder/state/use-resume-builder";
import { useResumeBuilderActions } from "@/features/resume-builder/state/use-resume-builder-actions";

const formatResumeDate = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const buildResumeTitle = (
  resumeConfig: SavedResume["config"],
  savedResumeCount: number,
) => {
  if (resumeConfig.targetRole || resumeConfig.targetCompany) {
    return `${resumeConfig.targetRole || "Untitled"} ${resumeConfig.targetCompany ? `@ ${resumeConfig.targetCompany}` : ""}`;
  }

  return `Untitled Resume ${savedResumeCount + 1}`;
};

export default function ResumeBuilderManualPage() {
  const router = useRouter();
  const { state, dispatch } = useResumeBuilder();
  const actions = useResumeBuilderActions();

  useEffect(() => {
    if (state.editor.mode === "edit") {
      dispatch({ type: "editor/startManualCreate" });
    }
  }, [dispatch, state.editor.mode]);

  if (state.editor.mode === "edit") {
    return null;
  }

  const handleSave = async () => {
    await actions.saveResume({
      title: buildResumeTitle(state.editor.resumeConfig, state.savedResumes.length),
      date: formatResumeDate(),
      status: "Draft",
      config: state.editor.resumeConfig,
    });

    dispatch({
      type: "ui/showToast",
      payload: { message: "New resume saved to Vault!" },
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
      isEditing={false}
      db={state.db}
      config={state.editor.resumeConfig}
      newSkill={state.editor.newSkill}
      showProjectForm={state.editor.showProjectForm}
      newProject={state.editor.newProject}
      onCancel={() => {
        dispatch({ type: "editor/startManualCreate" });
        router.push("/vault");
      }}
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
      onShowProjectForm={() =>
        dispatch({
          type: "editor/setProjectFormOpen",
          payload: { open: true },
        })
      }
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
      onShowExperienceForm={() =>
        dispatch({ type: "editor/setExperienceFormOpen", payload: { open: true } })
      }
      onHideExperienceForm={() =>
        dispatch({ type: "editor/setExperienceFormOpen", payload: { open: false } })
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
      onShowCertificateForm={() =>
        dispatch({ type: "editor/setCertificateFormOpen", payload: { open: true } })
      }
      onHideCertificateForm={() =>
        dispatch({ type: "editor/setCertificateFormOpen", payload: { open: false } })
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
      onShowAwardForm={() =>
        dispatch({ type: "editor/setAwardFormOpen", payload: { open: true } })
      }
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
