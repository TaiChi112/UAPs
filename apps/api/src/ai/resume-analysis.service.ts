import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

import type {
  AnalyzeJobDescriptionRequest,
  AnalyzeJobDescriptionResult,
  ResumeAnalysisService,
  ResumeConfig,
} from "@uaps/shared/resume-builder";

import { aiEnv, assertGoogleConfigured, type LlmProvider } from "./config";

const generatedResumeConfigSchema = z.object({
  targetRole: z.string().default(""),
  targetCompany: z.string().default(""),
  summary: z.string().default(""),
  selectedSkills: z.array(z.string()).default([]),
  selectedProjects: z.array(z.string()).default([]),
  selectedExperience: z.array(z.string()).default([]),
  selectedCerts: z.array(z.string()).default([]),
  selectedAwards: z.array(z.string()).default([]),
});

const generatedAnalyzeJobDescriptionResultSchema = z.object({
  suggestedConfig: generatedResumeConfigSchema,
  feedback: z.object({
    matchScore: z.coerce.number().int().default(0),
    missingSkills: z.array(z.string()).default([]),
  }),
});

type GeneratedResumeAnalysisResult = z.infer<
  typeof generatedAnalyzeJobDescriptionResultSchema
>;

export interface ResumeAnalysisGeneratorInput {
  modelName: string;
  prompt: string;
  systemPrompt: string;
}

export type ResumeAnalysisObjectGenerator = (
  input: ResumeAnalysisGeneratorInput,
) => Promise<GeneratedResumeAnalysisResult>;

export interface ResumeAnalysisServiceOptions {
  generateAnalysisObject?: ResumeAnalysisObjectGenerator;
  modelName?: string;
  provider?: LlmProvider;
}

const RESUME_ANALYSIS_SYSTEM_PROMPT = [
  "You are a resume tailoring engine for a resume vault and portfolio system.",
  "Your task is to analyze a job description against a candidate vault and return a strict JSON object.",
  "Only use IDs that are explicitly present in the provided vault arrays.",
  "Never invent IDs, skills, projects, experiences, certificates, awards, or employers.",
  "selectedSkills, selectedProjects, selectedExperience, selectedCerts, and selectedAwards must contain only literal IDs from the provided vault.",
  "feedback.missingSkills must contain only plain-text skill or requirement names that are important in the job description but not already present in the vault skills list.",
  "feedback.matchScore must be an integer from 0 to 100.",
  "Keep the summary concise, grounded in the provided vault, and relevant to the job description.",
  "If the job description does not clearly indicate a company, preserve the current targetCompany or return an empty string.",
  "If evidence is weak, return fewer selections rather than guessing.",
].join(" ");

const dedupeStrings = (values: readonly string[]) => {
  const seen = new Set<string>();
  const nextValues: string[] = [];

  for (const value of values) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      continue;
    }

    if (seen.has(normalizedValue)) {
      continue;
    }

    seen.add(normalizedValue);
    nextValues.push(normalizedValue);
  }

  return nextValues;
};

const normalizeSelectedIds = <TId extends string>(
  values: readonly string[],
  allowedIds: readonly TId[],
) => {
  const allowedIdSet = new Set(allowedIds.map(String));
  const seenIds = new Set<string>();
  const nextIds: TId[] = [];

  for (const value of values) {
    const normalizedValue = value.trim();

    if (!normalizedValue || !allowedIdSet.has(normalizedValue)) {
      continue;
    }

    if (seenIds.has(normalizedValue)) {
      continue;
    }

    seenIds.add(normalizedValue);
    nextIds.push(normalizedValue as TId);
  }

  return nextIds;
};

const normalizeMissingSkills = (
  missingSkills: readonly string[],
  request: AnalyzeJobDescriptionRequest,
) => {
  const existingSkillNames = new Set(
    request.vault.skills.map((skill) => skill.name.trim().toLowerCase()),
  );
  const seenNames = new Set<string>();
  const nextMissingSkills: string[] = [];

  for (const skillName of missingSkills) {
    const normalizedName = skillName.trim();
    const key = normalizedName.toLowerCase();

    if (!normalizedName || existingSkillNames.has(key) || seenNames.has(key)) {
      continue;
    }

    seenNames.add(key);
    nextMissingSkills.push(normalizedName);
  }

  return nextMissingSkills;
};

const clampMatchScore = (matchScore: number) =>
  Math.min(100, Math.max(0, Math.round(matchScore)));

const buildPromptInput = (request: AnalyzeJobDescriptionRequest) => ({
  instructions: {
    selectOnlyFromVault: true,
    neverInventIds: true,
    missingSkillsMustBePlainNames: true,
    preserveCurrentCompanyWhenUnknown: true,
  },
  jobDescription: request.jobDescription.trim(),
  currentConfig: {
    targetRole: request.currentConfig.targetRole,
    targetCompany: request.currentConfig.targetCompany,
    summary: request.currentConfig.summary,
    selectedSkills: request.currentConfig.selectedSkills.map(String),
    selectedProjects: request.currentConfig.selectedProjects.map(String),
    selectedExperience: request.currentConfig.selectedExperience.map(String),
    selectedCerts: request.currentConfig.selectedCerts.map(String),
    selectedAwards: request.currentConfig.selectedAwards.map(String),
    sectionOrder: request.currentConfig.sectionOrder,
  },
  vault: {
    basicInfo: request.vault.basicInfo,
    skills: request.vault.skills.map((skill) => ({
      id: String(skill.id),
      name: skill.name,
      category: skill.category,
    })),
    projects: request.vault.projects.map((project) => ({
      id: String(project.id),
      title: project.title,
      role: project.role,
      description: project.description,
    })),
    experience: request.vault.experience.map((experience) => ({
      id: String(experience.id),
      company: experience.company,
      role: experience.role,
      duration: experience.duration,
      responsibilities: experience.responsibilities,
    })),
    certificates: request.vault.certificates.map((certificate) => ({
      id: String(certificate.id),
      name: certificate.name,
      year: certificate.year,
    })),
    awards: request.vault.awards.map((award) => ({
      id: String(award.id),
      name: award.name,
      desc: award.desc,
    })),
  },
});

const buildResumeAnalysisPrompt = (request: AnalyzeJobDescriptionRequest) =>
  [
    "Analyze the job description against the current resume configuration and vault.",
    "Return the strongest tailored resume configuration using only the provided vault IDs.",
    "Input JSON:",
    JSON.stringify(buildPromptInput(request), null, 2),
  ].join("\n\n");

const normalizeGeneratedConfig = (
  request: AnalyzeJobDescriptionRequest,
  generatedConfig: GeneratedResumeAnalysisResult["suggestedConfig"],
): ResumeConfig => ({
  targetRole:
    generatedConfig.targetRole.trim() || request.currentConfig.targetRole.trim(),
  targetCompany:
    generatedConfig.targetCompany.trim() ||
    request.currentConfig.targetCompany.trim(),
  summary:
    generatedConfig.summary.trim() || request.currentConfig.summary.trim(),
  selectedSkills: normalizeSelectedIds(
    dedupeStrings(generatedConfig.selectedSkills),
    request.vault.skills.map((skill) => skill.id),
  ),
  selectedProjects: normalizeSelectedIds(
    dedupeStrings(generatedConfig.selectedProjects),
    request.vault.projects.map((project) => project.id),
  ),
  selectedExperience: normalizeSelectedIds(
    dedupeStrings(generatedConfig.selectedExperience),
    request.vault.experience.map((experience) => experience.id),
  ),
  selectedCerts: normalizeSelectedIds(
    dedupeStrings(generatedConfig.selectedCerts),
    request.vault.certificates.map((certificate) => certificate.id),
  ),
  selectedAwards: normalizeSelectedIds(
    dedupeStrings(generatedConfig.selectedAwards),
    request.vault.awards.map((award) => award.id),
  ),
  sectionOrder: request.currentConfig.sectionOrder,
});

export const normalizeResumeAnalysisResult = (
  request: AnalyzeJobDescriptionRequest,
  generatedResult: GeneratedResumeAnalysisResult,
): AnalyzeJobDescriptionResult => ({
  suggestedConfig: normalizeGeneratedConfig(request, generatedResult.suggestedConfig),
  feedback: {
    matchScore: clampMatchScore(generatedResult.feedback.matchScore),
    missingSkills: normalizeMissingSkills(
      dedupeStrings(generatedResult.feedback.missingSkills),
      request,
    ),
  },
});

const generateGoogleAnalysisObject: ResumeAnalysisObjectGenerator = async ({
  modelName,
  prompt,
  systemPrompt,
}) => {
  assertGoogleConfigured();

  const result = await generateText({
    model: google(modelName),
    system: systemPrompt,
    prompt,
    temperature: 0.2,
    output: Output.object({
      schema: generatedAnalyzeJobDescriptionResultSchema,
      name: "ResumeBuilderAnalysisResult",
      description:
        "Tailored resume selections and feedback for a job description analysis.",
    }),
  });

  return result.output;
};

const createConfiguredGenerator = (
  provider: LlmProvider,
): ResumeAnalysisObjectGenerator => {
  switch (provider) {
    case "google":
      return generateGoogleAnalysisObject;
    default: {
      const unsupportedProvider: never = provider;
      throw new Error(
        `Unsupported LLM provider: ${String(unsupportedProvider)}`,
      );
    }
  }
};

export const createResumeAnalysisService = (
  options: ResumeAnalysisServiceOptions = {},
): ResumeAnalysisService => {
  const provider = options.provider ?? aiEnv.provider;
  const modelName = options.modelName ?? aiEnv.model;
  const generateAnalysisObject =
    options.generateAnalysisObject ?? createConfiguredGenerator(provider);

  return {
    async analyzeJobDescription(
      request: AnalyzeJobDescriptionRequest,
    ): Promise<AnalyzeJobDescriptionResult> {
      const normalizedRequest: AnalyzeJobDescriptionRequest = {
        ...request,
        jobDescription: request.jobDescription.trim(),
      };
      const generatedResult = await generateAnalysisObject({
        modelName,
        prompt: buildResumeAnalysisPrompt(normalizedRequest),
        systemPrompt: RESUME_ANALYSIS_SYSTEM_PROMPT,
      });

      return normalizeResumeAnalysisResult(normalizedRequest, generatedResult);
    },
  };
};

export const resumeAnalysisService = createResumeAnalysisService();
