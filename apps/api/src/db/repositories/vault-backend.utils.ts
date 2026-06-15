import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type BasicInfo,
  type FeatureResumeStatus,
  type PersistedResumeStatus,
  type ResumeConfig,
  type SavedResume,
  type VaultData,
} from "@uaps/shared/resume-builder";

export type ResumeCompositionIds = {
  awardIds: string[];
  certificateIds: string[];
  experienceIds: string[];
  projectIds: string[];
  skillIds: string[];
};

export type ResumeRecordShape = {
  resumeId: string;
  summary?: string | null;
  targetCompany?: string | null;
  targetJobTitle?: string | null;
  title: string;
  updatedAt: Date | string;
  status: PersistedResumeStatus | string;
  visibility: string;
  authorName?: string;
  authorAvatarUrl?: string;
  sectionOrder?: string[];
} & ResumeCompositionIds;

const monthYearFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const asDate = (value: Date | string) =>
  value instanceof Date ? value : new Date(value);

export const formatResumeDate = (value: Date | string) =>
  fullDateFormatter.format(asDate(value));

export const formatDuration = (
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
) => {
  if (!startDate && !endDate) {
    return "";
  }

  const startLabel = startDate ? monthYearFormatter.format(asDate(startDate)) : "";
  const endLabel = endDate ? monthYearFormatter.format(asDate(endDate)) : "Present";

  if (!startLabel) {
    return endLabel;
  }

  return `${startLabel} - ${endLabel}`;
};

export const toFeatureResumeStatus = (
  status: PersistedResumeStatus | string,
): FeatureResumeStatus => {
  switch (status) {
    case "Published":
      return "Applied";
    case "Archived":
      return "Interviewing";
    default:
      return "Draft";
  }
};

export const toPersistedResumeStatus = (
  status: FeatureResumeStatus,
): PersistedResumeStatus => {
  switch (status) {
    case "Applied":
      return "Published";
    case "Interviewing":
      return "Archived";
    default:
      return "Draft";
  }
};

export const toSavedResume = ({
  experienceIds,
  projectIds,
  skillIds,
  certificateIds,
  awardIds,
  resumeId,
  status,
  summary,
  targetCompany,
  targetJobTitle,
  title,
  updatedAt,
  visibility,
  authorName,
  authorAvatarUrl,
  sectionOrder,
}: ResumeRecordShape): SavedResume => ({
  id: asResumeId(resumeId),
  title,
  date: formatResumeDate(updatedAt),
  status: toFeatureResumeStatus(status),
  visibility,
  authorName,
  authorAvatarUrl,
  config: {
    targetRole: targetJobTitle ?? "",
    targetCompany: targetCompany ?? "",
    summary: summary ?? "",
    selectedSkills: skillIds.map((skillId) => asSkillId(skillId)),
    selectedProjects: projectIds.map((projectId) => asProjectId(projectId)),
    selectedExperience: experienceIds.map((experienceId) =>
      asExperienceId(experienceId),
    ),
    selectedCerts: certificateIds.map((certificateId) =>
      asCertificateId(certificateId),
    ),
    selectedAwards: awardIds.map((awardId) => asAwardId(awardId)),
    sectionOrder: sectionOrder || ["skills", "projects", "experience", "certificates", "awards"],
  },
});

export const emptyVaultCollections = (): Pick<
  VaultData,
  "awards" | "certificates"
> => ({
  awards: [],
  certificates: [],
});

export const sanitizeIds = (ids: readonly string[]) =>
  [...new Set(ids.filter((id) => id.trim().length > 0))];

export const createEmptyResumeConfig = (): ResumeConfig => ({
  targetRole: "",
  targetCompany: "",
  summary: "",
  selectedSkills: [],
  selectedProjects: [],
  selectedExperience: [],
  selectedCerts: [],
  selectedAwards: [],
  sectionOrder: ["skills", "projects", "experience", "certificates", "awards"],
});

export const toBasicInfo = (input: {
  email: string | null | undefined;
  github: string | null | undefined;
  name: string | null | undefined;
  phone: string | null | undefined;
}): BasicInfo => ({
  name: input.name ?? "",
  email: input.email ?? "",
  phone: input.phone ?? "",
  github: input.github ?? "",
});
