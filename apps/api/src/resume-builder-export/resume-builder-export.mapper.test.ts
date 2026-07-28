import { describe, expect, it } from "bun:test";

import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type SavedResume,
  type VaultData,
} from "@uaps/shared/resume-builder";

import { mapResumeBuilderExportPayload } from "./resume-builder-export.mapper";

const createVaultFixture = (): VaultData => ({
  basicInfo: {
    name: "Somchai Coding",
    email: "somchai.c@example.com",
    phone: "+66 81 234 5678",
    linkedin: "github.com/somchaicodes",
  },
  skills: [
    { id: asSkillId("s1"), name: "Python", category: "programming" },
    { id: asSkillId("s5"), name: "AWS", category: "tools" },
  ],
  projects: [
    {
      id: asProjectId("p2"),
      title: "Customer Churn Prediction",
      duration: "",
      projectUrl: undefined,
      description: "Built a churn model with TensorFlow and Python.",
    },
  ],
  experience: [
    {
      id: asExperienceId("e1"),
      company: "Data Driven Co.",
      role: "Data Analyst Intern",
      duration: "Jun 2023 - Aug 2023",
      responsibilities: "Cleaned and pre-processed large datasets using Python.",
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
      name: "1st Place - Hackathon 2025",
      desc: "Built an AI-driven healthcare app.",
    },
  ],
});

const createResumeFixture = (): SavedResume => ({
  id: asResumeId("res-1"),
  title: "AI Engineer @ Company A",
  date: "10 May 2026",
  status: "Applied",
    visibility: "private",
    config: {
    targetRole: "AI Engineer",
    targetCompany: "Company A",
    summary:
      "Passionate AI Engineer aiming to build reliable machine-learning systems.",
    selectedSkills: [asSkillId("s5"), asSkillId("s1")],
    selectedProjects: [asProjectId("p2")],
    selectedExperience: [asExperienceId("e1")],
    selectedCerts: [asCertificateId("c1")],
    selectedAwards: [asAwardId("a1")],
    sectionOrder: [],
  },
});

describe("mapResumeBuilderExportPayload", () => {
  it("resolves selected vault items into an export payload in config order", () => {
    const payload = mapResumeBuilderExportPayload(
      createResumeFixture(),
      createVaultFixture(),
    );

    expect(payload.title).toBe("AI Engineer @ Company A");
    expect(payload.basicInfo.name).toBe("Somchai Coding");
    expect(payload.summary).toContain("Passionate AI Engineer");
    expect(payload.skills.map((skill) => skill.name)).toEqual([
      "AWS",
      "Python",
    ]);
    expect(payload.projects.map((project) => project.title)).toEqual([
      "Customer Churn Prediction",
    ]);
    expect(payload.experience.map((experience) => experience.company)).toEqual([
      "Data Driven Co.",
    ]);
    expect(payload.certificates.map((certificate) => certificate.name)).toEqual([
      "AWS Certified Developer",
    ]);
    expect(payload.awards.map((award) => award.name)).toEqual([
      "1st Place - Hackathon 2025",
    ]);
  });
});
