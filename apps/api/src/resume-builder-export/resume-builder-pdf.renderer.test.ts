import { describe, expect, it } from "bun:test";

import type { ResumeBuilderExportPayload } from "./resume-builder-export.types";
import { renderResumeBuilderPdf } from "./resume-builder-pdf.renderer";

const createPayloadFixture = (): ResumeBuilderExportPayload => ({
  title: "AI Engineer @ Company A",
  fileName: "ai-engineer-company-a",
  date: "10 May 2026",
  status: "Applied",
  basicInfo: {
    name: "Somchai Coding",
    email: "somchai.c@example.com",
    phone: "+66 81 234 5678",
    github: "github.com/somchaicodes",
  },
  targetRole: "AI Engineer",
  targetCompany: "Company A",
  summary:
    "Passionate AI Engineer aiming to build reliable machine-learning systems.",
  skills: [
    { name: "Python", category: "programming" },
    { name: "AWS", category: "tools" },
  ],
  projects: [
    {
      title: "Customer Churn Prediction",
      role: "AI Engineer",
      description: "Built a churn model with TensorFlow and Python.",
    },
  ],
  experience: [
    {
      company: "Data Driven Co.",
      role: "Data Analyst Intern",
      duration: "Jun 2023 - Aug 2023",
      responsibilities: "Cleaned and pre-processed large datasets using Python.",
    },
  ],
  certificates: [
    {
      name: "AWS Certified Developer",
      year: "2025",
    },
  ],
  awards: [
    {
      name: "1st Place - Hackathon 2025",
      desc: "Built an AI-driven healthcare app.",
    },
  ],
});

describe("renderResumeBuilderPdf", () => {
  it("renders a binary PDF document", async () => {
    const pdfBytes = await renderResumeBuilderPdf(createPayloadFixture());
    const pdfText = Buffer.from(pdfBytes).toString("latin1");

    expect(Buffer.from(pdfBytes).subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(pdfBytes.byteLength).toBeGreaterThan(1024);
    expect(pdfText).toContain("<544543484e4943414c20534b494c4c53>");
    expect(pdfText).toContain("/Count 1");
  });

  it("skips empty certificate and award sections entirely", async () => {
    const pdfBytes = await renderResumeBuilderPdf({
      ...createPayloadFixture(),
      certificates: [],
      awards: [],
    });
    const pdfText = Buffer.from(pdfBytes).toString("latin1");

    expect(pdfText).not.toContain("No certificates selected for this resume.");
    expect(pdfText).not.toContain("No awards selected for this resume.");
    expect(pdfText).not.toContain("CERTIFICATES");
    expect(pdfText).not.toContain("AWARDS");
  });
});
