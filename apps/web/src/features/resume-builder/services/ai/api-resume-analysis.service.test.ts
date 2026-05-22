import type { AnalyzeJobDescriptionResult } from "@uaps/shared/resume-builder";
import type { MutationResult } from "@/lib/api";
import { describe, expect, it, vi } from "vitest";

import { ApiResumeAnalysisService } from "./api-resume-analysis.service";

import { EMPTY_RESUME_CONFIG, INITIAL_VAULT_DATA } from "@/features/resume-builder/constants/mock-seed";
import { analyzeResumeBuilderJobDescription } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    analyzeResumeBuilderJobDescription: vi.fn(),
  };
});

const mockAnalyzeResumeBuilderJobDescription = vi.mocked(
  analyzeResumeBuilderJobDescription,
);

const baseRequest = {
  jobDescription: "Need strong TypeScript and React experience.",
  vault: INITIAL_VAULT_DATA,
  currentConfig: EMPTY_RESUME_CONFIG,
};

const analysisResult: AnalyzeJobDescriptionResult = {
  suggestedConfig: {
    ...EMPTY_RESUME_CONFIG,
    targetRole: "Frontend Engineer",
  },
  feedback: {
    matchScore: 72,
    missingSkills: ["GraphQL"],
  },
};

describe("ApiResumeAnalysisService", () => {
  it("maps unauthorized responses to a sign-in error", async () => {
    const service = new ApiResumeAnalysisService();

    mockAnalyzeResumeBuilderJobDescription.mockResolvedValueOnce({
      ok: false,
      data: null,
      message: "Unauthorized",
      statusCode: 401,
    } satisfies MutationResult<AnalyzeJobDescriptionResult>);

    await expect(service.analyzeJobDescription(baseRequest)).rejects.toThrow(
      "Please sign in to use AI analysis.",
    );
  });

  it("returns the parsed structured result when the API succeeds", async () => {
    const service = new ApiResumeAnalysisService();

    mockAnalyzeResumeBuilderJobDescription.mockResolvedValueOnce({
      ok: true,
      data: analysisResult,
      statusCode: 200,
    } satisfies MutationResult<AnalyzeJobDescriptionResult>);

    await expect(service.analyzeJobDescription(baseRequest)).resolves.toEqual(
      analysisResult,
    );
  });
});
