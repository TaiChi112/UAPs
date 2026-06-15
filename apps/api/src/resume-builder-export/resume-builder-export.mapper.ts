import type { SavedResume, VaultData } from "@uaps/shared/resume-builder";

import type {
  ResumeBuilderExportAward,
  ResumeBuilderExportCertificate,
  ResumeBuilderExportExperience,
  ResumeBuilderExportPayload,
  ResumeBuilderExportProject,
  ResumeBuilderExportSkill,
} from "./resume-builder-export.types";

const slugify = (value: string) => {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedValue || "resume";
};

const mapSelectionsById = <
  TId extends string,
  TItem extends { id: TId },
  TOutput,
>(
  selectedIds: readonly TId[],
  items: readonly TItem[],
  mapItem: (item: TItem) => TOutput,
) => {
  const itemsById = new Map(items.map((item) => [item.id, item] as const));

  return selectedIds.flatMap((selectedId) => {
    const matchedItem = itemsById.get(selectedId);
    return matchedItem ? [mapItem(matchedItem)] : [];
  });
};

const mapSkills = (
  savedResume: SavedResume,
  vault: VaultData,
): ResumeBuilderExportSkill[] =>
  mapSelectionsById(savedResume.config.selectedSkills, vault.skills, (skill) => ({
    name: skill.name,
    category: skill.category,
  }));

const mapProjects = (
  savedResume: SavedResume,
  vault: VaultData,
): ResumeBuilderExportProject[] =>
  mapSelectionsById(
    savedResume.config.selectedProjects,
    vault.projects,
    (project) => ({
      title: project.title,
      duration: project.duration,
      description: project.description,
      githubUrl: project.githubUrl,
    }),
  );

const mapExperience = (
  savedResume: SavedResume,
  vault: VaultData,
): ResumeBuilderExportExperience[] =>
  mapSelectionsById(
    savedResume.config.selectedExperience,
    vault.experience,
    (experience) => ({
      company: experience.company,
      role: experience.role,
      duration: experience.duration,
      responsibilities: experience.responsibilities,
    }),
  );

const mapCertificates = (
  savedResume: SavedResume,
  vault: VaultData,
): ResumeBuilderExportCertificate[] =>
  mapSelectionsById(
    savedResume.config.selectedCerts,
    vault.certificates,
    (certificate) => ({
      name: certificate.name,
      year: certificate.year,
    }),
  );

const mapAwards = (
  savedResume: SavedResume,
  vault: VaultData,
): ResumeBuilderExportAward[] =>
  mapSelectionsById(savedResume.config.selectedAwards, vault.awards, (award) => ({
    name: award.name,
    desc: award.desc,
  }));

export const mapResumeBuilderExportPayload = (
  savedResume: SavedResume,
  vault: VaultData,
): ResumeBuilderExportPayload => ({
  title: savedResume.title,
  fileName: slugify(savedResume.title),
  date: savedResume.date,
  status: savedResume.status,
  basicInfo: {
    name: vault.basicInfo.name,
    email: vault.basicInfo.email,
    phone: vault.basicInfo.phone,
    github: vault.basicInfo.github,
  },
  targetRole: savedResume.config.targetRole,
  targetCompany: savedResume.config.targetCompany,
  summary: savedResume.config.summary,
  skills: mapSkills(savedResume, vault),
  projects: mapProjects(savedResume, vault),
  experience: mapExperience(savedResume, vault),
  certificates: mapCertificates(savedResume, vault),
  awards: mapAwards(savedResume, vault),
  sectionOrder: savedResume.config.sectionOrder || ["skills", "projects", "experience", "certificates", "awards"],
});
