"use client";

import {
  type FeatureResumeStatus,
  type NewProjectDraft,
  type ResumeId,
  type UpsertSavedResumeInput,
  type VaultProject,
  type VaultSkill,
} from "@uaps/shared/resume-builder";

import { getResumeBuilderRepository } from "@/features/resume-builder/services/repositories";
import { getResumeAnalysisService } from "@/features/resume-builder/services/ai";
import { ResumeAnalysisRequestError } from "@/features/resume-builder/services/ai/api-resume-analysis.service";
import { downloadResumeBuilderPdf } from "@/lib/api";

import { useResumeBuilder } from "./use-resume-builder";

export function useResumeBuilderActions() {
  const { state, dispatch } = useResumeBuilder();
  const repository = getResumeBuilderRepository();
  const resumeAnalysisService = getResumeAnalysisService();

  return {
    async loadSnapshot() {
      const snapshot = await repository.loadSnapshot();

      dispatch({
        type: "data/hydrateSnapshot",
        payload: { snapshot },
      });

      return snapshot;
    },

    async addSkillToVault(skillName: string): Promise<VaultSkill | null> {
      if (!skillName.trim()) {
        return null;
      }

      const skill = await repository.createSkill({
        name: skillName,
        category: "custom",
      });

      dispatch({
        type: "editor/addSkillToVault",
        payload: {
          skillId: skill.id,
          skillName: skill.name,
        },
      });

      return skill;
    },

    async addProjectToVault(
      draft: NewProjectDraft,
    ): Promise<VaultProject | null> {
      if (!draft.title.trim()) {
        return null;
      }

      const project = await repository.createProject(draft);

      dispatch({
        type: "editor/addProjectToVault",
        payload: {
          projectId: project.id,
          draft: {
            title: project.title,
            role: project.role,
            description: project.description,
          },
        },
      });

      return project;
    },

    async saveResume(input: UpsertSavedResumeInput) {
      const resume = await repository.saveResume(input);

      dispatch({ type: "resume/upsert", payload: { resume } });

      return resume;
    },

    async duplicateResume(resumeId: ResumeId, duplicatedAt: string) {
      const duplicatedResume = await repository.duplicateResume(
        resumeId,
        duplicatedAt,
      );

      if (!duplicatedResume) {
        return null;
      }

      dispatch({
        type: "resume/duplicate",
        payload: { duplicatedResume },
      });

      return duplicatedResume;
    },

    async deleteResume(resumeId: ResumeId) {
      const deleted = await repository.deleteResume(resumeId);

      if (deleted) {
        dispatch({ type: "resume/delete", payload: { resumeId } });
      }

      return deleted;
    },

    async updateResumeStatus(
      resumeId: ResumeId,
      status: FeatureResumeStatus,
    ) {
      const updatedResume = await repository.updateResumeStatus(resumeId, status);

      if (updatedResume) {
        dispatch({
          type: "resume/updateStatus",
          payload: { resumeId, status: updatedResume.status },
        });
      }

      return updatedResume;
    },

    async analyzeJobDescription(jobDescription: string) {
      if (!jobDescription.trim()) {
        dispatch({
          type: "ui/showToast",
          payload: { message: "Please paste a Job Description first." },
        });
        return null;
      }

      if (state.ai.analysisState === "analyzing") {
        return null;
      }

      dispatch({ type: "ai/startAnalysis" });

      try {
        const analysis = await resumeAnalysisService.analyzeJobDescription({
          jobDescription,
          vault: state.db,
          currentConfig: state.editor.resumeConfig,
        });

        dispatch({
          type: "ai/completeAnalysis",
          payload: analysis,
        });

        return analysis;
      } catch (error) {
        dispatch({ type: "ai/failAnalysis" });
        const message =
          error instanceof ResumeAnalysisRequestError
            ? error.message
            : error instanceof Error
              ? `Analysis failed: ${error.message}`
              : "Analysis failed. Please try again in a moment.";

        dispatch({
          type: "ui/showToast",
          payload: { message },
        });
        console.error("Resume analysis failed", error);

        return null;
      }
    },

    async downloadResumePdf(resumeId: ResumeId) {
      const result = await downloadResumeBuilderPdf(String(resumeId));

      if (!result.ok || !result.data) {
        throw new Error(result.message ?? "Failed to download resume PDF");
      }

      const objectUrl = window.URL.createObjectURL(result.data.blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = result.data.fileName;
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);

      return result.data.fileName;
    },

    async fixMissingSkill(skillName: string) {
      const skill = await repository.createSkill({
        name: skillName,
        category: "custom",
      });

      dispatch({
        type: "ai/fixMissingSkill",
        payload: {
          skillId: skill.id,
          skillName: skill.name,
        },
      });

      return skill;
    },
  };
}
