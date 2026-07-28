import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type ResumeBuilderSnapshot,
  type ResumeConfig,
  type SavedResume,
  type VaultData,
} from "@uaps/shared/resume-builder";

import {
  INITIAL_SAVED_RESUMES,
  INITIAL_VAULT_DATA,
} from "@/features/resume-builder/constants/mock-seed";

export const cloneResumeConfig = (config: ResumeConfig): ResumeConfig => ({
  ...config,
  selectedSkills: [...config.selectedSkills],
  selectedProjects: [...config.selectedProjects],
  selectedExperience: [...config.selectedExperience],
  selectedCerts: [...config.selectedCerts],
  selectedAwards: [...config.selectedAwards],
  sectionOrder: [...(config.sectionOrder ?? ["skills", "projects", "experience", "certificates", "awards"])],
});

export const cloneSavedResume = (resume: SavedResume): SavedResume => ({
  ...resume,
  config: cloneResumeConfig(resume.config),
});

export const cloneVaultData = (vault: VaultData): VaultData => ({
  basicInfo: { ...vault.basicInfo },
  skills: vault.skills.map((skill) => ({ ...skill })),
  projects: vault.projects.map((project) => ({ ...project })),
  experience: vault.experience.map((experience) => ({ ...experience })),
  certificates: vault.certificates.map((certificate) => ({ ...certificate })),
  awards: vault.awards.map((award) => ({ ...award })),
});

export const cloneSnapshot = (
  snapshot: ResumeBuilderSnapshot,
): ResumeBuilderSnapshot => ({
  source: snapshot.source,
  vault: cloneVaultData(snapshot.vault),
  savedResumes: snapshot.savedResumes.map(cloneSavedResume),
});

export const createSeedSnapshot = (
  source: ResumeBuilderSnapshot["source"] = "mock",
): ResumeBuilderSnapshot => ({
  source,
  vault: cloneVaultData(INITIAL_VAULT_DATA),
  savedResumes: INITIAL_SAVED_RESUMES.map(cloneSavedResume),
});

type RawResumeConfig = {
  targetRole?: string;
  targetCompany?: string;
  summary?: string;
  selectedSkills?: string[];
  selectedProjects?: string[];
  selectedExperience?: string[];
  selectedCerts?: string[];
  selectedAwards?: string[];
  sectionOrder?: string[];
};

type RawSavedResume = {
  id?: string;
  title?: string;
  date?: string;
  status?: SavedResume["status"];
  visibility?: SavedResume["visibility"];
  config?: RawResumeConfig;
};

type RawVaultData = {
  basicInfo?: VaultData["basicInfo"];
  skills?: Array<{ id?: string; name?: string; category?: string }>;
  projects?: Array<{
    id?: string;
    title?: string;
    role?: string;
    description?: string;
    duration?: string;
    projectUrl?: string;
  }>;
  experience?: Array<{
    id?: string;
    company?: string;
    role?: string;
    duration?: string;
    responsibilities?: string;
  }>;
  certificates?: Array<{ id?: string; name?: string; year?: string }>;
  awards?: Array<{ id?: string; name?: string; desc?: string }>;
};

type RawSnapshot = {
  source?: ResumeBuilderSnapshot["source"];
  vault?: RawVaultData;
  savedResumes?: RawSavedResume[];
};

export const normalizeResumeConfig = (
  config: RawResumeConfig | ResumeConfig | undefined,
): ResumeConfig => ({
  targetRole: config?.targetRole ?? "",
  targetCompany: config?.targetCompany ?? "",
  summary: config?.summary ?? "",
  selectedSkills: (config?.selectedSkills ?? []).map((id) => asSkillId(String(id))),
  selectedProjects: (config?.selectedProjects ?? []).map((id) =>
    asProjectId(String(id)),
  ),
  selectedExperience: (config?.selectedExperience ?? []).map((id) =>
    asExperienceId(String(id)),
  ),
  selectedCerts: (config?.selectedCerts ?? []).map((id) =>
    asCertificateId(String(id)),
  ),
  selectedAwards: (config?.selectedAwards ?? []).map((id) =>
    asAwardId(String(id)),
  ),
  sectionOrder: config?.sectionOrder ?? ["skills", "projects", "experience", "certificates", "awards"],
});

export const normalizeSavedResume = (
  resume: RawSavedResume | SavedResume,
): SavedResume => ({
  id: asResumeId(String(resume.id ?? `res-${Date.now()}`)),
  title: resume.title ?? "Untitled Resume",
  date: resume.date ?? "",
  status: resume.status ?? "Draft",
  visibility: resume.visibility ?? "private",
  config: normalizeResumeConfig(resume.config),
});

export const normalizeVaultData = (
  vault: RawVaultData | VaultData | undefined,
): VaultData => ({
  basicInfo: {
    name: vault?.basicInfo?.name ?? "",
    email: vault?.basicInfo?.email ?? "",
    phone: vault?.basicInfo?.phone ?? "",
    linkedin: vault?.basicInfo?.linkedin ?? "",
  },
  skills: (vault?.skills ?? []).map((skill) => ({
    id: asSkillId(String(skill.id ?? `s-${Date.now()}`)),
    name: skill.name ?? "",
    category: skill.category ?? "custom",
  })),
  projects: (vault?.projects ?? []).map((project) => ({
    id: asProjectId(String(project.id ?? `p-${Date.now()}`)),
    title: project.title ?? "",
    duration: project.duration ?? "",
    description: project.description ?? "",
    projectUrl: project.projectUrl ?? "",
  })),
  experience: (vault?.experience ?? []).map((experience) => ({
    id: asExperienceId(String(experience.id ?? `e-${Date.now()}`)),
    company: experience.company ?? "",
    role: experience.role ?? "",
    duration: experience.duration ?? "",
    responsibilities: experience.responsibilities ?? "",
  })),
  certificates: (vault?.certificates ?? []).map((certificate) => ({
    id: asCertificateId(String(certificate.id ?? `c-${Date.now()}`)),
    name: certificate.name ?? "",
    year: certificate.year ?? "",
  })),
  awards: (vault?.awards ?? []).map((award) => ({
    id: asAwardId(String(award.id ?? `a-${Date.now()}`)),
    name: award.name ?? "",
    desc: award.desc ?? "",
  })),
});

export const normalizeSnapshot = (
  snapshot: RawSnapshot | ResumeBuilderSnapshot | undefined,
  fallbackSource: ResumeBuilderSnapshot["source"] = "mock",
): ResumeBuilderSnapshot => {
  if (!snapshot) {
    return createSeedSnapshot(fallbackSource);
  }

  return {
    source: snapshot.source ?? fallbackSource,
    vault: normalizeVaultData(snapshot.vault),
    savedResumes: (snapshot.savedResumes ?? []).map(normalizeSavedResume),
  };
};

export const createStorageKey = () => "uaps.resume-builder.snapshot";
