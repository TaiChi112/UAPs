"use client";

import {
  asProjectId,
  asSkillId,
  type AnalyzeJobDescriptionResult,
  type FeatureResumeStatus,
  type NewProjectDraft,
  type ResumeId,
  type UpsertSavedResumeInput,
  type VaultProject,
  type VaultSkill,
} from "@uaps/shared/resume-builder";

import { getResumeBuilderRepository } from "@/features/resume-builder/services/repositories";

import { useResumeBuilder } from "./use-resume-builder";

const createSuggestedAnalysis = (): AnalyzeJobDescriptionResult => ({
  suggestedConfig: {
    targetRole: "Data Engineer (Suggested)",
    targetCompany: "Tech Corp",
    summary:
      "Data Engineer with expertise in Python and AWS, aiming to optimize data pipelines as required in the Job Description.",
    selectedSkills: [asSkillId("s1"), asSkillId("s5")],
    selectedProjects: [asProjectId("p2")],
    selectedExperience: [],
    selectedCerts: [],
    selectedAwards: [],
  },
  feedback: {
    matchScore: 65,
    missingSkills: ["Kubernetes", "Apache Kafka", "Go"],
  },
});

const delay = (durationMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });

export function useResumeBuilderActions() {
  const { dispatch } = useResumeBuilder();
  const repository = getResumeBuilderRepository();

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
        return null;
      }

      dispatch({ type: "ai/startAnalysis" });
      await delay(2500);

      const analysis = createSuggestedAnalysis();

      dispatch({
        type: "ai/completeAnalysis",
        payload: analysis,
      });

      return analysis;
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
