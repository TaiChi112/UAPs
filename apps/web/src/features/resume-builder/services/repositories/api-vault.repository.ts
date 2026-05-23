import type {
  CreateSkillInput,
  FeatureResumeStatus,
  NewProjectDraft,
  ResumeBuilderSnapshot,
  ResumeId,
  SavedResume,
  UpsertSavedResumeInput,
  VaultProject,
  VaultRepository,
  VaultSkill,
} from "@uaps/shared/resume-builder";

import {
  createResumeBuilderProject,
  createResumeBuilderResume,
  createResumeBuilderSkill,
  deleteResumeBuilderResume,
  duplicateResumeBuilderResume,
  getResumeBuilderSnapshot,
  updateResumeBuilderResume,
  updateResumeBuilderStatus,
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

  async createProject(input: NewProjectDraft): Promise<VaultProject> {
    const result = await createResumeBuilderProject(input);

    if (!result.ok || !result.data) {
      throw new Error(
        result.message ?? "Failed to create resume builder project",
      );
    }

    return result.data;
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
}
