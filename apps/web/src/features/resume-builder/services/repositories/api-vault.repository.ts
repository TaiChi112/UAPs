import type {
  CreateSkillInput,
  FeatureResumeStatus,
  NewAwardDraft,
  NewCertificateDraft,
  NewExperienceDraft,
  NewProjectDraft,
  ResumeBuilderSnapshot,
  ResumeId,
  SavedResume,
  UpsertSavedResumeInput,
  VaultProject,
  VaultRepository,
  VaultSkill,
  VaultExperience,
  VaultCertificate,
  VaultAward,
  ProjectId,
  SkillId,
  ExperienceId,
  CertificateId,
  AwardId,
} from "@uaps/shared/resume-builder";

import {
  createResumeBuilderProject,
  createResumeBuilderResume,
  createResumeBuilderSkill,
  deleteResumeBuilderResume,
  duplicateResumeBuilderResume,
  getResumeBuilderPublicResumes,
  getResumeBuilderSnapshot,
  updateResumeBuilderResume,
  updateResumeBuilderStatus,
  updateResumeBuilderVisibility,
  updateResumeBuilderProject,
  deleteResumeBuilderProject,
  updateResumeBuilderSkill,
  deleteResumeBuilderSkill,
  createResumeBuilderExperience,
  updateResumeBuilderExperience,
  deleteResumeBuilderExperience,
  createResumeBuilderCertificate,
  updateResumeBuilderCertificate,
  deleteResumeBuilderCertificate,
  createResumeBuilderAward,
  updateResumeBuilderAward,
  deleteResumeBuilderAward,
} from "@/lib/api";

export class ApiVaultRepository implements VaultRepository {
  async loadSnapshot(): Promise<ResumeBuilderSnapshot> {
    const snapshot = await getResumeBuilderSnapshot();

    if (!snapshot) {
      throw new Error("Resume builder snapshot is unavailable");
    }

    return {
      source: "api",
      vault: snapshot.vault,
      savedResumes: snapshot.savedResumes,
    };
  }

  async createSkill(input: CreateSkillInput): Promise<VaultSkill> {
    const result = await createResumeBuilderSkill(input);

    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to create resume builder skill");
    }

    return result.data;
  }

  async updateSkill(skillId: import("@uaps/shared/resume-builder").SkillId, input: CreateSkillInput): Promise<VaultSkill> {
    const result = await updateResumeBuilderSkill(String(skillId), input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to update resume builder skill");
    }
    return result.data;
  }

  async deleteSkill(skillId: import("@uaps/shared/resume-builder").SkillId): Promise<boolean> {
    const result = await deleteResumeBuilderSkill(String(skillId));
    if (!result.ok) {
      throw new Error(result.message ?? "Failed to delete resume builder skill");
    }
    return true;
  }

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    const result = await createResumeBuilderProject(input);

    if (!result.ok || !result.data) {
      throw new Error(
        result.message ?? "Failed to create resume builder project",
      );
    }

    return result.data;
  }

  async updateProject(projectId: import("@uaps/shared/resume-builder").ProjectId, input: NewProjectDraft): Promise<VaultProject> {
    const result = await updateResumeBuilderProject(String(projectId), input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to update resume builder project");
    }
    return result.data;
  }

  async deleteProject(projectId: import("@uaps/shared/resume-builder").ProjectId): Promise<boolean> {
    const result = await deleteResumeBuilderProject(String(projectId));
    if (!result.ok) {
      throw new Error(result.message ?? "Failed to delete resume builder project");
    }
    return true;
  }

  async createExperience(input: NewExperienceDraft): Promise<VaultExperience> {
    const result = await createResumeBuilderExperience(input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to create resume builder experience");
    }
    return result.data;
  }

  async updateExperience(experienceId: import("@uaps/shared/resume-builder").ExperienceId, input: NewExperienceDraft): Promise<VaultExperience> {
    const result = await updateResumeBuilderExperience(String(experienceId), input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to update resume builder experience");
    }
    return result.data;
  }

  async deleteExperience(experienceId: import("@uaps/shared/resume-builder").ExperienceId): Promise<boolean> {
    const result = await deleteResumeBuilderExperience(String(experienceId));
    if (!result.ok) {
      throw new Error(result.message ?? "Failed to delete resume builder experience");
    }
    return true;
  }

  async createCertificate(input: NewCertificateDraft): Promise<VaultCertificate> {
    const result = await createResumeBuilderCertificate(input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to create resume builder certificate");
    }
    return result.data;
  }

  async updateCertificate(certificateId: import("@uaps/shared/resume-builder").CertificateId, input: NewCertificateDraft): Promise<VaultCertificate> {
    const result = await updateResumeBuilderCertificate(String(certificateId), input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to update resume builder certificate");
    }
    return result.data;
  }

  async deleteCertificate(certificateId: import("@uaps/shared/resume-builder").CertificateId): Promise<boolean> {
    const result = await deleteResumeBuilderCertificate(String(certificateId));
    if (!result.ok) {
      throw new Error(result.message ?? "Failed to delete resume builder certificate");
    }
    return true;
  }

  async createAward(input: NewAwardDraft): Promise<VaultAward> {
    const result = await createResumeBuilderAward(input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to create resume builder award");
    }
    return result.data;
  }

  async updateAward(awardId: import("@uaps/shared/resume-builder").AwardId, input: NewAwardDraft): Promise<VaultAward> {
    const result = await updateResumeBuilderAward(String(awardId), input);
    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to update resume builder award");
    }
    return result.data;
  }

  async deleteAward(awardId: import("@uaps/shared/resume-builder").AwardId): Promise<boolean> {
    const result = await deleteResumeBuilderAward(String(awardId));
    if (!result.ok) {
      throw new Error(result.message ?? "Failed to delete resume builder award");
    }
    return true;
  }

  async saveResume(input: UpsertSavedResumeInput): Promise<SavedResume> {
    const payload = {
      title: input.title,
      date: input.date,
      status: input.status,
      config: input.config,
    };
    const result = input.resumeId
      ? await updateResumeBuilderResume(String(input.resumeId), payload)
      : await createResumeBuilderResume(payload);

    if (!result.ok || !result.data) {
      throw new Error(result.message ?? "Failed to save resume builder resume");
    }

    return result.data;
  }

  async duplicateResume(
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    const result = await duplicateResumeBuilderResume(String(resumeId), {
      duplicatedAt,
    });

    if (!result.ok) {
      throw new Error(
        result.message ?? "Failed to duplicate resume builder resume",
      );
    }

    return result.data;
  }

  async deleteResume(resumeId: ResumeId): Promise<boolean> {
    const result = await deleteResumeBuilderResume(String(resumeId));

    if (!result.ok) {
      throw new Error(
        result.message ?? "Failed to delete resume builder resume",
      );
    }

    return true;
  }

  async updateResumeStatus(
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    const result = await updateResumeBuilderStatus(String(resumeId), { status });

    if (!result.ok) {
      throw new Error(
        result.message ?? "Failed to update resume builder status",
      );
    }

    return result.data;
  }

  async updateResumeVisibility(
    resumeId: ResumeId,
    visibility: string,
  ): Promise<SavedResume | null> {
    const result = await updateResumeBuilderVisibility(String(resumeId), { visibility });

    if (!result.ok) {
      throw new Error(
        result.message ?? "Failed to update resume builder visibility",
      );
    }

    return result.data;
  }

  async getPublicResumes(): Promise<SavedResume[]> {
    const result = await getResumeBuilderPublicResumes();
    return result || [];
  }
}
