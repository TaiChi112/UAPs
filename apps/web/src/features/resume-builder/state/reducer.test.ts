import { asResumeId, asSkillId } from "@uaps/shared/resume-builder";
import { describe, expect, it } from "vitest";

import {
  createInitialResumeBuilderState,
  cloneSavedResume,
} from "./initial-state";
import { resumeBuilderReducer } from "./reducer";

import {
  INITIAL_SAVED_RESUMES,
  INITIAL_VAULT_DATA,
} from "@/features/resume-builder/constants/mock-seed";

describe("resumeBuilderReducer", () => {
  it("hydrates the vault snapshot without mutating the source payload", () => {
    const state = createInitialResumeBuilderState();
    const snapshot = {
      source: "hybrid" as const,
      vault: {
        ...INITIAL_VAULT_DATA,
        skills: [
          ...INITIAL_VAULT_DATA.skills,
          {
            id: asSkillId("s-hydrated"),
            name: "Rust",
            category: "programming",
          },
        ],
      },
      savedResumes: [
        cloneSavedResume(INITIAL_SAVED_RESUMES[0]),
        {
          ...cloneSavedResume(INITIAL_SAVED_RESUMES[1]),
          id: asResumeId("res-hydrated"),
        },
      ],
    };

    const nextState = resumeBuilderReducer(state, {
      type: "data/hydrateSnapshot",
      payload: { snapshot },
    });

    expect(nextState.db.skills).toHaveLength(INITIAL_VAULT_DATA.skills.length + 1);
    expect(nextState.savedResumes).toHaveLength(2);

    nextState.db.skills[0].name = "Mutated";

    expect(snapshot.vault.skills[0].name).toBe(INITIAL_VAULT_DATA.skills[0].name);
  });

  it("loads a saved resume into edit mode and closes the preview modal", () => {
    const state = {
      ...createInitialResumeBuilderState(),
      ui: {
        toastMessage: null,
        previewModal: {
          kind: "open" as const,
          resume: cloneSavedResume(INITIAL_SAVED_RESUMES[0]),
        },
      },
    };

    const nextState = resumeBuilderReducer(state, {
      type: "editor/loadResumeForEdit",
      payload: { resumeId: INITIAL_SAVED_RESUMES[0].id },
    });

    expect(nextState.editor.mode).toBe("edit");
    expect(nextState.editor.editingResumeId).toBe(INITIAL_SAVED_RESUMES[0].id);
    expect(nextState.editor.resumeConfig.targetRole).toBe(
      INITIAL_SAVED_RESUMES[0].config.targetRole,
    );
    expect(nextState.ui.previewModal).toEqual({ kind: "closed" });
  });

  it("adds a fixed missing skill to the vault, selects it, and improves the score", () => {
    const state = {
      ...createInitialResumeBuilderState(),
      ai: {
        ...createInitialResumeBuilderState().ai,
        feedback: {
          matchScore: 65,
          missingSkills: ["Kubernetes", "Apache Kafka"],
        },
      },
    };

    const nextState = resumeBuilderReducer(state, {
      type: "ai/fixMissingSkill",
      payload: {
        skillId: asSkillId("s-kubernetes"),
        skillName: "Kubernetes",
      },
    });

    expect(
      nextState.db.skills.some((skill) => skill.id === asSkillId("s-kubernetes")),
    ).toBe(true);
    expect(nextState.editor.resumeConfig.selectedSkills).toContain(
      asSkillId("s-kubernetes"),
    );
    expect(nextState.ai.feedback.missingSkills).toEqual(["Apache Kafka"]);
    expect(nextState.ai.feedback.matchScore).toBe(75);
  });
});
