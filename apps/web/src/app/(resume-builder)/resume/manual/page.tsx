"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";

import type {
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
      isEditing={false}
      db={state.db}
      config={state.editor.resumeConfig}
      newSkill={state.editor.newSkill}
      showProjectForm={state.editor.showProjectForm}
      newProject={state.editor.newProject}
      onCancel={() => {
        dispatch({ type: "editor/startManualCreate" });
        router.push("/");
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
    />
  );
}
