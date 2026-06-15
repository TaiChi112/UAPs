import type { SavedResume } from "@uaps/shared/resume-builder";

export type ResumeBuilderExportBasicInfo = {
  name: string;
  email: string;
  phone: string;
  github: string;
};

export type ResumeBuilderExportSkill = {
  name: string;
  category: string;
};

export type ResumeBuilderExportProject = {
  title: string;
  duration: string;
  description: string;
  githubUrl?: string;
};

export type ResumeBuilderExportExperience = {
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
};

export type ResumeBuilderExportCertificate = {
  name: string;
  year: string;
};

export type ResumeBuilderExportAward = {
  name: string;
  desc: string;
};

export type ResumeBuilderExportPayload = {
  title: string;
  fileName: string;
  date: string;
  status: SavedResume["status"];
  basicInfo: ResumeBuilderExportBasicInfo;
  targetRole: string;
  targetCompany: string;
  summary: string;
  skills: ResumeBuilderExportSkill[];
  projects: ResumeBuilderExportProject[];
  experience: ResumeBuilderExportExperience[];
  certificates: ResumeBuilderExportCertificate[];
  awards: ResumeBuilderExportAward[];
  sectionOrder: string[];
};
