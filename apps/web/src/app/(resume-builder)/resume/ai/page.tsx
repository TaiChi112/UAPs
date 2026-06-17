"use client";

import type { SavedResume } from "@uaps/shared/resume-builder";
import { useRouter } from "next/navigation";

import { AiBuilderView } from "@/features/resume-builder/components/ai/ai-builder-view";
import { EMPTY_RESUME_CONFIG } from "@/features/resume-builder/constants/mock-seed";
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

export default function ResumeBuilderAiPage() {
  const router = useRouter();
  const { state, dispatch } = useResumeBuilder();
  const actions = useResumeBuilderActions();

  const handleSave = async () => {
    const existingResume =
      state.editor.mode === "edit" && state.editor.editingResumeId
        ? state.savedResumes.find(
            (item) => item.id === state.editor.editingResumeId,
          )
        : null;

    await actions.saveResume({
      resumeId: existingResume?.id,
      title: buildResumeTitle(
        state.editor.resumeConfig,
        state.savedResumes.length,
      ),
      date: existingResume?.date ?? formatResumeDate(),
      status: existingResume?.status ?? "Draft",
      config: state.editor.resumeConfig,
    });

    dispatch({
      type: "ui/showToast",
      payload: { message: "New resume saved to Vault!" },
    });
    router.push("/vault");
  };

  return (
    <AiBuilderView
      toastMessage={state.ui.toastMessage}
      aiAnalysisState={state.ai.analysisState}
      aiFeedback={state.ai.feedback}
      db={state.db}
      jobDescription={state.ai.jobDescription}
      emptyConfig={EMPTY_RESUME_CONFIG}
      resumeConfig={state.editor.resumeConfig}
      onBack={() => router.push("/vault")}
      onSwitchToManual={() => router.push("/resume/manual")}
      onSave={handleSave}
      onJobDescriptionChange={(value) =>
        dispatch({ type: "ai/setJobDescription", payload: { value } })
      }
      onUseSample={() =>
        dispatch({
          type: "ai/setJobDescription",
          payload: {
            value:
              "Looking for a Data Engineer with strong Python skills, AWS experience, and knowledge of Kubernetes.",
          },
        })
      }
      onAnalyze={async () => {
        if (!state.ai.jobDescription.trim()) {
          dispatch({
            type: "ui/showToast",
            payload: { message: "Please paste a Job Description first." },
          });
          return;
        }

        await actions.analyzeJobDescription(state.ai.jobDescription);
      }}
      onFixMissingSkill={async (skill) => {
        await actions.fixMissingSkill(skill);
        dispatch({
          type: "ui/showToast",
          payload: { message: `Added ${skill} to your Vault!` },
        });
      }}
    />
  );
}
