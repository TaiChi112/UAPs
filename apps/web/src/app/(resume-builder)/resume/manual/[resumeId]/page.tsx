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
      title: buildResumeTitle(state.editor.resumeConfig, state.savedResumes.length),
      date: savedResume.date,
      status: savedResume.status,
      config: state.editor.resumeConfig,
    });

    dispatch({
      type: "ui/showToast",
      payload: { message: "Resume updated successfully!" },
    });
    router.push("/");
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
      onCancel={() => router.push("/")}
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
      onToggleExperience={(experienceId: ExperienceId) =>
        dispatch({
          type: "editor/toggleExperience",
          payload: { experienceId },
        })
      }
      onToggleCert={(certificateId: CertificateId) =>
        dispatch({
          type: "editor/toggleCertificate",
          payload: { certificateId },
        })
      }
      onToggleAward={(awardId: AwardId) =>
        dispatch({
          type: "editor/toggleAward",
          payload: { awardId },
        })
      }
    />
  );
}
