import { asResumeId } from "@uaps/shared/resume-builder";
import { describe, expect, it } from "vitest";

import { MockVaultRepository } from "./mock-vault.repository";

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

describe("MockVaultRepository", () => {
  it("returns cloned snapshots so callers cannot mutate stored state", async () => {
    const repository = new MockVaultRepository({
      storage: new MemoryStorage(),
      now: () => 101,
    });

    const firstSnapshot = await repository.loadSnapshot();
    firstSnapshot.vault.skills[0].name = "Mutated";

    const secondSnapshot = await repository.loadSnapshot();

    expect(secondSnapshot.vault.skills[0].name).not.toBe("Mutated");
  });

  it("persists created skills and saved resumes", async () => {
    const repository = new MockVaultRepository({
      storage: new MemoryStorage(),
      now: () => 202,
    });

    const skill = await repository.createSkill({
      name: "GraphQL",
      category: "custom",
    });

    const savedResume = await repository.saveResume({
      title: "GraphQL Engineer",
      date: "21 May 2026",
      status: "Draft",
      config: {
        targetRole: "GraphQL Engineer",
        targetCompany: "Schema Labs",
        summary: "Builds graph-based APIs.",
        selectedSkills: [skill.id],
        selectedProjects: [],
        selectedExperience: [],
        selectedCerts: [],
        selectedAwards: [], sectionOrder: [],
      },
    });

    const snapshot = await repository.loadSnapshot();

    expect(snapshot.vault.skills.at(-1)?.name).toBe("GraphQL");
    expect(
      snapshot.savedResumes.some((resume) => resume.id === savedResume.id),
    ).toBe(true);
  });

  it("duplicates, updates, and deletes resumes through the stored snapshot", async () => {
    const repository = new MockVaultRepository({
      storage: new MemoryStorage(),
      now: () => 303,
    });

    const duplicatedResume = await repository.duplicateResume(
      asResumeId("res-1"),
      "22 May 2026",
    );

    expect(duplicatedResume?.title).toContain("(Copy)");
    expect(duplicatedResume?.status).toBe("Draft");

    const updatedResume = await repository.updateResumeStatus(
      asResumeId("res-1"),
      "Interviewing",
    );

    expect(updatedResume?.status).toBe("Interviewing");

    const deleted = await repository.deleteResume(asResumeId("res-1"));
    const snapshot = await repository.loadSnapshot();

    expect(deleted).toBe(true);
    expect(snapshot.savedResumes.some((resume) => resume.id === asResumeId("res-1"))).toBe(false);
  });
});
