import { describe, expect, it } from "bun:test";

import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asSkillId,
  type AnalyzeJobDescriptionRequest,
  type AnalyzeJobDescriptionResult,
  type ResumeConfig,
  type VaultData,
} from "@uaps/shared/resume-builder";

import { createResumeAnalysisService } from "./resume-analysis.service";

const createVaultFixture = (): VaultData => ({
  basicInfo: {
    name: "Somchai Coding",
    email: "somchai.c@example.com",
    phone: "+66 81 234 5678",
    github: "github.com/somchaicodes",
  },
  skills: [
    { id: asSkillId("s1"), name: "Python", category: "programming" },
    { id: asSkillId("s5"), name: "AWS", category: "tools" },
  ],
  projects: [
    {
      id: asProjectId("p2"),
      title: "Customer Churn Prediction",
      role: "AI Engineer",
      description: "Built a churn model with TensorFlow.",
    },
  ],
  experience: [
    {
      id: asExperienceId("e1"),
      company: "Data Driven Co.",
      role: "Data Analyst Intern",
      duration: "Jun 2023 - Aug 2023",
      responsibilities: "Cleaned and pre-processed datasets using Python.",
    },
  ],
  certificates: [
    {
      id: asCertificateId("c1"),
      name: "AWS Certified Developer",
      year: "2025",
    },
  ],
  awards: [
    {
      id: asAwardId("a1"),
      name: "Hackathon Winner",
      desc: "Built an AI healthcare prototype.",
    },
  ],
});

const createResumeConfigFixture = (): ResumeConfig => ({
  targetRole: "Existing Role",
  targetCompany: "Existing Company",
  summary: "Existing summary",
  selectedSkills: [],
  selectedProjects: [],
  selectedExperience: [],
  selectedCerts: [],
  selectedAwards: [],
});

const createRequestFixture = (): AnalyzeJobDescriptionRequest => ({
  jobDescription:
    "We are hiring a Data Engineer with Python, AWS, Kubernetes, and Go experience.",
  vault: createVaultFixture(),
  currentConfig: createResumeConfigFixture(),
});

describe("createResumeAnalysisService", () => {
  it("filters invalid IDs, deduplicates selections, and normalizes feedback", async () => {
    const service = createResumeAnalysisService({
      generateAnalysisObject: async () => ({
        suggestedConfig: {
          targetRole: "  Senior Data Engineer  ",
          targetCompany: "   ",
          summary: "  Tailored summary for the posted role.  ",
          selectedSkills: ["s1", "missing-skill", "s1", "s5"],
          selectedProjects: ["p2", "missing-project", "p2"],
          selectedExperience: ["e1", "missing-experience"],
          selectedCerts: ["c1", "missing-certificate"],
          selectedAwards: ["a1", "missing-award"],
        },
        feedback: {
          matchScore: 135,
          missingSkills: [" Kubernetes ", "python", "", "Go", "go"],
        },
      }),
    });

    const result = await service.analyzeJobDescription(createRequestFixture());

    expect(result).toEqual<AnalyzeJobDescriptionResult>({
      suggestedConfig: {
        targetRole: "Senior Data Engineer",
        targetCompany: "Existing Company",
        summary: "Tailored summary for the posted role.",
        selectedSkills: [asSkillId("s1"), asSkillId("s5")],
        selectedProjects: [asProjectId("p2")],
        selectedExperience: [asExperienceId("e1")],
        selectedCerts: [asCertificateId("c1")],
        selectedAwards: [asAwardId("a1")],
      },
      feedback: {
        matchScore: 100,
        missingSkills: ["Kubernetes", "Go"],
      },
    });
  });
});
