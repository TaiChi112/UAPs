"use client";

import {
  type FeatureResumeStatus,
  type NewProjectDraft,
  type NewExperienceDraft,
  type NewCertificateDraft,
  type NewAwardDraft,
  type ProjectId,
  type ExperienceId,
  type CertificateId,
  type AwardId,
  type ResumeId,
  type UpsertSavedResumeInput,
  type VaultProject,
  type VaultExperience,
  type VaultCertificate,
  type VaultAward,
  type VaultSkill,
  type SkillId,
  type SavedResume,
  type VaultData,
} from "@uaps/shared/resume-builder";

import { getResumeBuilderRepository } from "@/features/resume-builder/services/repositories";
import { getResumeAnalysisService } from "@/features/resume-builder/services/ai";
import { ResumeAnalysisRequestError } from "@/features/resume-builder/services/ai/api-resume-analysis.service";
import { downloadResumeBuilderPdf, previewResumeBuilderPdf } from "@/lib/api";

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
            description: project.description,
            startDate: draft.startDate,
            endDate: draft.endDate,
          },
        },
      });

      return project;
    },

    async updateProjectInVault(projectId: ProjectId, draft: NewProjectDraft): Promise<VaultProject | null> {
      if (!draft.title.trim()) {
        return null;
      }

      const project = await repository.updateProject(projectId, draft);

      dispatch({
        type: "editor/updateProjectInVault",
        payload: {
          projectId: project.id,
          draft: {
            title: project.title,
            description: project.description,
            startDate: draft.startDate,
            endDate: draft.endDate,
          },
        },
      });

      return project;
    },

    async deleteProjectFromVault(projectId: ProjectId): Promise<boolean> {
      const deleted = await repository.deleteProject(projectId);
      if (deleted) {
        dispatch({
          type: "editor/deleteProjectFromVault",
          payload: { projectId },
        });
      }
      return deleted;
    },

    async addExperienceToVault(
      draft: NewExperienceDraft,
    ): Promise<VaultExperience | null> {
      if (!draft.role.trim() || !draft.company.trim()) {
        return null;
      }

      const experience = await repository.createExperience(draft);

      dispatch({
        type: "editor/addExperienceToVault",
        payload: {
          experienceId: experience.id,
          draft: {
            company: experience.company,
            role: experience.role,
            startDate: draft.startDate,
            endDate: draft.endDate,
            responsibilities: experience.responsibilities || "",
          },
        },
      });

      return experience;
    },

    async updateExperienceInVault(experienceId: ExperienceId, draft: NewExperienceDraft): Promise<VaultExperience | null> {
      if (!draft.role.trim() || !draft.company.trim()) {
        return null;
      }

      const experience = await repository.updateExperience(experienceId, draft);

      dispatch({
        type: "editor/updateExperienceInVault",
        payload: {
          experienceId: experience.id,
          draft: {
            company: experience.company,
            role: experience.role,
            startDate: draft.startDate,
            endDate: draft.endDate,
            responsibilities: experience.responsibilities || "",
          },
        },
      });

      return experience;
    },

    async deleteExperienceFromVault(experienceId: ExperienceId): Promise<boolean> {
      const deleted = await repository.deleteExperience(experienceId);
      if (deleted) {
        dispatch({
          type: "editor/deleteExperienceFromVault",
          payload: { experienceId },
        });
      }
      return deleted;
    },

    async addCertificateToVault(
      draft: NewCertificateDraft,
    ): Promise<VaultCertificate | null> {
      if (!draft.name.trim()) {
        return null;
      }

      const certificate = await repository.createCertificate(draft);

      dispatch({
        type: "editor/addCertificateToVault",
        payload: {
          certificateId: certificate.id,
          draft: {
            name: certificate.name,
            year: certificate.year || "",
          },
        },
      });

      return certificate;
    },

    async updateCertificateInVault(certificateId: CertificateId, draft: NewCertificateDraft): Promise<VaultCertificate | null> {
      if (!draft.name.trim()) {
        return null;
      }

      const certificate = await repository.updateCertificate(certificateId, draft);

      dispatch({
        type: "editor/updateCertificateInVault",
        payload: {
          certificateId: certificate.id,
          draft: {
            name: certificate.name,
            year: certificate.year || "",
          },
        },
      });

      return certificate;
    },

    async deleteCertificateFromVault(certificateId: CertificateId): Promise<boolean> {
      const deleted = await repository.deleteCertificate(certificateId);
      if (deleted) {
        dispatch({
          type: "editor/deleteCertificateFromVault",
          payload: { certificateId },
        });
      }
      return deleted;
    },

    async addAwardToVault(
      draft: NewAwardDraft,
    ): Promise<VaultAward | null> {
      if (!draft.name.trim()) {
        return null;
      }

      const award = await repository.createAward(draft);

      dispatch({
        type: "editor/addAwardToVault",
        payload: {
          awardId: award.id,
          draft: {
            name: award.name,
            desc: award.desc || "",
          },
        },
      });

      return award;
    },

    async updateAwardInVault(awardId: AwardId, draft: NewAwardDraft): Promise<VaultAward | null> {
      if (!draft.name.trim()) {
        return null;
      }

      const award = await repository.updateAward(awardId, draft);

      dispatch({
        type: "editor/updateAwardInVault",
        payload: {
          awardId: award.id,
          draft: {
            name: award.name,
            desc: award.desc || "",
          },
        },
      });

      return award;
    },

    async deleteAwardFromVault(awardId: AwardId): Promise<boolean> {
      const deleted = await repository.deleteAward(awardId);
      if (deleted) {
        dispatch({
          type: "editor/deleteAwardFromVault",
          payload: { awardId },
        });
      }
      return deleted;
    },

    async updateSkillInVault(skillId: SkillId, skillName: string): Promise<VaultSkill | null> {
      if (!skillName.trim()) {
        return null;
      }

      const skill = await repository.updateSkill(skillId, {
        name: skillName,
        category: "custom",
      });

      dispatch({
        type: "editor/updateSkillInVault",
        payload: {
          skillId: skill.id,
          skillName: skill.name,
        },
      });

      return skill;
    },

    async deleteSkillFromVault(skillId: SkillId): Promise<boolean> {
      const deleted = await repository.deleteSkill(skillId);
      if (deleted) {
        dispatch({
          type: "editor/deleteSkillFromVault",
          payload: { skillId },
        });
      }
      return deleted;
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

    async updateResumeVisibility(
      resumeId: ResumeId,
      visibility: string,
    ) {
      const updatedResume = await repository.updateResumeVisibility(resumeId, visibility);

      if (updatedResume) {
        dispatch({
          type: "resume/updateVisibility",
          payload: { resumeId, visibility: (updatedResume as any).visibility || visibility },
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

    async downloadResumePdf(resume: SavedResume, vault: VaultData) {
      const result = await previewResumeBuilderPdf({ resume, vault });

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
