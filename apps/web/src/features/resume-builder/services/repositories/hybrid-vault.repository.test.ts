import {
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type VaultRepository,
} from "@uaps/shared/resume-builder";
import { describe, expect, it } from "vitest";

import { HybridVaultRepository } from "./hybrid-vault.repository";

import {
  INITIAL_SAVED_RESUMES,
  INITIAL_VAULT_DATA,
} from "@/features/resume-builder/constants/mock-seed";

const createFallbackRepository = (): VaultRepository => ({
  loadSnapshot: async () => ({
    source: "mock",
    vault: INITIAL_VAULT_DATA,
    savedResumes: INITIAL_SAVED_RESUMES,
  }),
  createSkill: async (input) => ({
    id: asSkillId("s-fallback"),
    name: input.name,
    category: input.category,
  }),
  createProject: async (input) => ({
    id: asProjectId("p-fallback"),
    title: input.title,
    role: input.role,
    description: input.description,
  }),
  saveResume: async (input) => ({
    id: input.resumeId ?? asResumeId("res-fallback"),
    title: input.title,
    date: input.date,
    status: input.status,
    config: input.config,
  }),
  duplicateResume: async () => null,
  deleteResume: async () => true,
  updateResumeStatus: async (resumeId, status) => ({
    ...INITIAL_SAVED_RESUMES[0],
    id: resumeId,
    status,
  }),
});

describe("HybridVaultRepository", () => {
  it("keeps API-backed resumes and supported collections authoritative while preserving fallback-only unsupported fields", async () => {
    const fallbackRepository = createFallbackRepository();
    const apiRepository: VaultRepository = {
      ...createFallbackRepository(),
      loadSnapshot: async () => ({
        source: "api",
        vault: {
          ...INITIAL_VAULT_DATA,
          skills: [
            {
              id: asSkillId("s-api"),
              name: "Kubernetes",
              category: "tools",
            },
          ],
          projects: [
            {
              id: asProjectId("p-api"),
              title: "Realtime Platform",
              role: "Platform Engineer",
              description: "Scaled event-driven APIs.",
            },
          ],
          experience: [
            {
              id: asExperienceId("e-api"),
              company: "Cloud Labs",
              role: "Platform Engineer",
              duration: "2025",
              responsibilities: "Built Kubernetes operators.",
            },
          ],
        },
        savedResumes: [],
      }),
    };

    const repository = new HybridVaultRepository({
      apiRepository,
      fallbackRepository,
    });

    const snapshot = await repository.loadSnapshot();

    expect(snapshot.source).toBe("api");
    expect(snapshot.savedResumes).toEqual([]);
    expect(snapshot.vault.skills.some((skill) => skill.name === "Kubernetes")).toBe(
      true,
    );
    expect(
      snapshot.vault.skills.some((skill) => skill.name === "Python"),
    ).toBe(false);
    expect(
      snapshot.vault.projects.some((project) => project.title === "Realtime Platform"),
    ).toBe(true);
    expect(snapshot.vault.certificates).toEqual(INITIAL_VAULT_DATA.certificates);
  });

  it("falls back cleanly when the API repository throws during a supported mutation", async () => {
    const fallbackRepository = createFallbackRepository();
    const apiRepository: VaultRepository = {
      ...createFallbackRepository(),
      loadSnapshot: async () => ({
        source: "api",
        vault: INITIAL_VAULT_DATA,
        savedResumes: [],
      }),
      createSkill: async () => {
        throw new Error("API unavailable");
      },
    };

    const repository = new HybridVaultRepository({
      apiRepository,
      fallbackRepository,
    });

    const skill = await repository.createSkill({
      name: "Docker Compose",
      category: "tools",
    });

    expect(skill.id).toBe(asSkillId("s-fallback"));
    expect(skill.name).toBe("Docker Compose");
  });
});
