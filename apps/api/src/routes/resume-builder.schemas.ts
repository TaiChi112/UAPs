import { z } from "zod";

import {
  FEATURE_RESUME_STATUS_VALUES,
  type AnalyzeJobDescriptionRequest,
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type CreateSkillInput,
  type FeatureResumeStatus,
  type NewProjectDraft,
  type ResumeConfig,
  type ResumeId,
  type UpsertSavedResumeInput,
} from "@uaps/shared/resume-builder";

const brandedIdSchema = z.string().min(1).max(100);

const resumeConfigSchema = z
  .object({
    targetRole: z.string().max(255),
    targetCompany: z.string().max(255),
    summary: z.string().max(5000),
    selectedSkills: z.array(brandedIdSchema).default([]),
    selectedProjects: z.array(brandedIdSchema).default([]),
    selectedExperience: z.array(brandedIdSchema).default([]),
    selectedCerts: z.array(brandedIdSchema).default([]),
    selectedAwards: z.array(brandedIdSchema).default([]),
  })
  .transform(
    (value): ResumeConfig => ({
      targetRole: value.targetRole.trim(),
      targetCompany: value.targetCompany.trim(),
      summary: value.summary.trim(),
      selectedSkills: value.selectedSkills.map(asSkillId),
      selectedProjects: value.selectedProjects.map(asProjectId),
      selectedExperience: value.selectedExperience.map(asExperienceId),
      selectedCerts: value.selectedCerts.map(asCertificateId),
      selectedAwards: value.selectedAwards.map(asAwardId),
    }),
  );

const basicInfoSchema = z.object({
  name: z.string().max(255),
  email: z.string().max(255),
  phone: z.string().max(100),
  github: z.string().max(255),
});

const vaultSkillSchema = z.object({
  id: brandedIdSchema,
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
});

const vaultProjectSchema = z.object({
  id: brandedIdSchema,
  title: z.string().min(1).max(255),
  role: z.string().max(255),
  description: z.string().max(5000),
});

const vaultExperienceSchema = z.object({
  id: brandedIdSchema,
  company: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  duration: z.string().max(255),
  responsibilities: z.string().max(5000),
});

const vaultCertificateSchema = z.object({
  id: brandedIdSchema,
  name: z.string().min(1).max(255),
  year: z.string().max(100),
});

const vaultAwardSchema = z.object({
  id: brandedIdSchema,
  name: z.string().min(1).max(255),
  desc: z.string().max(5000),
});

const vaultDataSchema = z
  .object({
    basicInfo: basicInfoSchema,
    skills: z.array(vaultSkillSchema).default([]),
    projects: z.array(vaultProjectSchema).default([]),
    experience: z.array(vaultExperienceSchema).default([]),
    certificates: z.array(vaultCertificateSchema).default([]),
    awards: z.array(vaultAwardSchema).default([]),
  })
  .transform((value) => ({
    basicInfo: {
      name: value.basicInfo.name.trim(),
      email: value.basicInfo.email.trim(),
      phone: value.basicInfo.phone.trim(),
      github: value.basicInfo.github.trim(),
    },
    skills: value.skills.map((skill) => ({
      id: asSkillId(skill.id),
      name: skill.name.trim(),
      category: skill.category.trim(),
    })),
    projects: value.projects.map((project) => ({
      id: asProjectId(project.id),
      title: project.title.trim(),
      role: project.role.trim(),
      description: project.description.trim(),
    })),
    experience: value.experience.map((experience) => ({
      id: asExperienceId(experience.id),
      company: experience.company.trim(),
      role: experience.role.trim(),
      duration: experience.duration.trim(),
      responsibilities: experience.responsibilities.trim(),
    })),
    certificates: value.certificates.map((certificate) => ({
      id: asCertificateId(certificate.id),
      name: certificate.name.trim(),
      year: certificate.year.trim(),
    })),
    awards: value.awards.map((award) => ({
      id: asAwardId(award.id),
      name: award.name.trim(),
      desc: award.desc.trim(),
    })),
  }));

export const createSkillInputSchema = z
  .object({
    name: z.string().min(1).max(100),
    category: z.string().min(1).max(100),
  })
  .transform(
    (value): CreateSkillInput => ({
      name: value.name.trim(),
      category: value.category.trim(),
    }),
  );

export const newProjectDraftSchema = z
  .object({
    title: z.string().min(1).max(255),
    role: z.string().min(1).max(255),
    description: z.string().min(1).max(5000),
  })
  .transform(
    (value): NewProjectDraft => ({
      title: value.title.trim(),
      role: value.role.trim(),
      description: value.description.trim(),
    }),
  );

export const upsertSavedResumeBodySchema = z
  .object({
    title: z.string().min(1).max(255),
    date: z.string().min(1).max(100),
    status: z.enum(FEATURE_RESUME_STATUS_VALUES),
    config: resumeConfigSchema,
  })
  .transform(
    (value): Omit<UpsertSavedResumeInput, "resumeId"> => ({
      title: value.title.trim(),
      date: value.date.trim(),
      status: value.status,
      config: value.config,
    }),
  );

export const resumeIdParamSchema = z
  .object({
    resumeId: brandedIdSchema,
  })
  .transform(
    (value): { resumeId: ResumeId } => ({
      resumeId: asResumeId(value.resumeId),
    }),
  );

export const duplicateResumeBodySchema = z.object({
  duplicatedAt: z.string().min(1).max(100),
});

export const updateResumeStatusBodySchema = z.object({
  status: z.enum(FEATURE_RESUME_STATUS_VALUES),
});

export type UpdateResumeStatusBody = {
  status: FeatureResumeStatus;
};

export const analyzeJobDescriptionRequestSchema = z
  .object({
    jobDescription: z.string().min(1).max(20000),
    vault: vaultDataSchema,
    currentConfig: resumeConfigSchema,
  })
  .transform(
    (value): AnalyzeJobDescriptionRequest => ({
      jobDescription: value.jobDescription.trim(),
      vault: value.vault,
      currentConfig: value.currentConfig,
    }),
  );
