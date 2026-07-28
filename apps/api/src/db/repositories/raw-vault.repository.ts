import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type FeatureResumeStatus,
  type NewProjectDraft,
  type ResumeId,
  type SavedResume,
  type UpsertSavedResumeInput,
  type VaultData,
  type VaultProject,
  type VaultSkill,
} from "@uaps/shared/resume-builder";
import type { PoolClient } from "pg";

import { query, withTransaction } from "../raw";

import type {
  IVaultBackendRepository,
  VaultBackendSnapshot,
  VaultBackendUserId,
} from "./vault-backend.types";
import {
  emptyVaultCollections,
  formatDuration,
  sanitizeIds,
  toBasicInfo,
  toPersistedResumeStatus,
  toSavedResume,
} from "./vault-backend.utils";

type BasicInfoRow = {
  email: string;
  
  linkedin: string;
  name: string;
  phone: string;
};

type SkillRow = {
  category: string;
  name: string;
  skill_id: string;
};

type ProjectRow = {
  description: string | null;
  project_id: string;
  title: string;
  project_url: string | null;
};

type CertificateRow = {
  certificate_id: string;
  name: string;
  year: string;
};

type AwardRow = {
  award_id: string;
  description: string;
  name: string;
};

type ExperienceRow = {
  achievement: string | null;
  description: string | null;
  end_date: Date | string | null;
  experience_id: string;
  organization: string;
  role: string;
  start_date: Date | string | null;
};

type ResumeRow = {
  resume_id: string;
  status: string;
  summary: string | null;
  target_company: string | null;
  target_job_title: string | null;
  updated_at: Date | string;
  version_name: string;
  visibility: string | null;
};

type CompositionLinkRow = {
  entity_id: string;
  resume_id: string;
};

type UserProfileRow = {
  email: string;
  linkedin_url: string | null;
  name: string;
  phone: string | null;
};

const requireSingleRow = <TRow>(rows: TRow[], message: string) => {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
};

const mapCompositionRows = (rows: CompositionLinkRow[]) => {
  const compositionMap = new Map<string, string[]>();

  for (const row of rows) {
    const currentIds = compositionMap.get(row.resume_id) ?? [];
    currentIds.push(row.entity_id);
    compositionMap.set(row.resume_id, currentIds);
  }

  return compositionMap;
};

const getLatestBasicInfo = async (userId: VaultBackendUserId) => {
  const result = await query<BasicInfoRow>(
    `
      SELECT
        COALESCE(rb.full_name, u.name) AS name,
        COALESCE(rb.email, u.email) AS email,
        COALESCE(rb.phone, '') AS phone,
        COALESCE(rb.github_url, u.github_url, '') AS github
      FROM users u
      LEFT JOIN LATERAL (
        SELECT rb.full_name, rb.email, rb.phone, rb.github_url
        FROM resume_basics rb
        JOIN resumes r ON r.resume_id = rb.resume_id
        WHERE r.user_id = u.user_id
        ORDER BY rb.updated_at DESC
        LIMIT 1
      ) rb ON true
      WHERE u.user_id = $1
    `,
    [userId],
  );

  return toBasicInfo(requireSingleRow(result.rows, "User profile not found"));
};

const setResumeComposition = async (
  client: PoolClient,
  userId: VaultBackendUserId,
  resumeId: string,
  config: UpsertSavedResumeInput["config"],
) => {
  await client.query(`DELETE FROM resume_awards WHERE resume_id = $1`, [resumeId]);
  await client.query(`DELETE FROM resume_certificates WHERE resume_id = $1`, [
    resumeId,
  ]);
  await client.query(`DELETE FROM resume_projects WHERE resume_id = $1`, [
    resumeId,
  ]);
  await client.query(`DELETE FROM resume_skills WHERE resume_id = $1`, [resumeId]);
  await client.query(`DELETE FROM resume_experiences WHERE resume_id = $1`, [
    resumeId,
  ]);

  const projectIds = sanitizeIds(config.selectedProjects.map(String));
  const skillIds = sanitizeIds(config.selectedSkills.map(String));
  const experienceIds = sanitizeIds(config.selectedExperience.map(String));
  const certificateIds = sanitizeIds(config.selectedCerts.map(String));
  const awardIds = sanitizeIds(config.selectedAwards.map(String));

  if (projectIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_projects (resume_id, project_id)
        SELECT $1, p.project_id
        FROM unnest($2::uuid[]) AS selected(project_id)
        JOIN projects p ON p.project_id = selected.project_id
        WHERE p.user_id = $3
      `,
      [resumeId, projectIds, userId],
    );
  }

  if (skillIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_skills (resume_id, skill_id)
        SELECT $1, s.skill_id
        FROM unnest($2::uuid[]) AS selected(skill_id)
        JOIN user_skills s ON s.skill_id = selected.skill_id
        WHERE s.user_id = $3
      `,
      [resumeId, skillIds, userId],
    );
  }

  if (experienceIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_experiences (resume_id, experience_id)
        SELECT $1, e.experience_id
        FROM unnest($2::uuid[]) AS selected(experience_id)
        JOIN experiences e ON e.experience_id = selected.experience_id
        WHERE e.user_id = $3
      `,
      [resumeId, experienceIds, userId],
    );
  }

  if (certificateIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_certificates (resume_id, certificate_id)
        SELECT $1, c.certificate_id
        FROM unnest($2::uuid[]) AS selected(certificate_id)
        JOIN certificates c ON c.certificate_id = selected.certificate_id
        WHERE c.user_id = $3
      `,
      [resumeId, certificateIds, userId],
    );
  }

  if (awardIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_awards (resume_id, award_id)
        SELECT $1, a.award_id
        FROM unnest($2::uuid[]) AS selected(award_id)
        JOIN awards a ON a.award_id = selected.award_id
        WHERE a.user_id = $3
      `,
      [resumeId, awardIds, userId],
    );
  }

  await client.query(
    `UPDATE resumes SET updated_at = CURRENT_TIMESTAMP WHERE resume_id = $1`,
    [resumeId],
  );
};

const upsertResumeBasic = async (
  client: PoolClient,
  userId: VaultBackendUserId,
  resumeId: string,
  summary: string,
) => {
  const userProfileResult = await client.query<UserProfileRow>(
    `
      SELECT
        u.name,
        u.email,
        u.github_url,
        (
          SELECT rb.phone
          FROM resume_basics rb
          JOIN resumes r ON r.resume_id = rb.resume_id
          WHERE r.user_id = u.user_id
          ORDER BY rb.updated_at DESC
          LIMIT 1
        ) AS phone
      FROM users u
      WHERE u.user_id = $1
    `,
    [userId],
  );
  const userProfile = requireSingleRow(
    userProfileResult.rows,
    "User profile not found for resume baseline",
  );

  await client.query(
    `
      INSERT INTO resume_basics (
        resume_id,
        full_name,
        email,
        phone,
        github_url,
        summary,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (resume_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        github_url = EXCLUDED.github_url,
        summary = EXCLUDED.summary,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      resumeId,
      userProfile.name,
      userProfile.email,
      userProfile.phone,
      userProfile.linkedin_url,
      summary,
    ],
  );
};

export class RawVaultRepository implements IVaultBackendRepository {
  async loadSnapshot(userId: VaultBackendUserId): Promise<VaultBackendSnapshot> {
    const [vault, savedResumes] = await Promise.all([
      this.loadVaultData(userId),
      this.loadSavedResumes(userId),
    ]);

    return {
      vault,
      savedResumes,
    };
  }

  async loadVaultData(userId: VaultBackendUserId): Promise<VaultData> {
    const [
      basicInfo,
      skillResult,
      projectResult,
      experienceResult,
      certificateResult,
      awardResult,
    ] =
      await Promise.all([
        getLatestBasicInfo(userId),
        query<SkillRow>(
          `
            SELECT s.skill_id, s.name, s.category
            FROM user_skills us
            JOIN skills s ON s.skill_id = us.skill_id
            WHERE us.user_id = $1
            ORDER BY s.name ASC
          `,
          [userId],
        ),
        query<ProjectRow>(
          `
            SELECT project_id, title, description
            FROM projects
            WHERE user_id = $1
            ORDER BY updated_at DESC
          `,
          [userId],
        ),
        query<ExperienceRow>(
          `
            SELECT experience_id, organization, role, description, achievement, start_date, end_date
            FROM experiences
            WHERE user_id = $1
            ORDER BY updated_at DESC
          `,
          [userId],
        ),
        query<CertificateRow>(
          `
            SELECT certificate_id, name, year
            FROM certificates
            WHERE user_id = $1
            ORDER BY updated_at DESC
          `,
          [userId],
        ),
        query<AwardRow>(
          `
            SELECT award_id, name, description
            FROM awards
            WHERE user_id = $1
            ORDER BY updated_at DESC
          `,
          [userId],
        ),
      ]);

    return {
      basicInfo,
      skills: skillResult.rows.map((skill) => ({
        id: asSkillId(skill.skill_id),
        name: skill.name,
        category: skill.category,
      })),
      projects: projectResult.rows.map((project) => ({
        id: asProjectId(project.project_id),
        title: project.title,
        duration: "",
        projectUrl: project.project_url ?? undefined,
        description: project.description ?? "",
      })),
      experience: experienceResult.rows.map((experience) => ({
        id: asExperienceId(experience.experience_id),
        company: experience.organization,
        role: experience.role,
        duration: formatDuration(experience.start_date, experience.end_date),
        responsibilities:
          experience.achievement ?? experience.description ?? "",
      })),
      certificates:
        certificateResult.rows.length > 0
          ? certificateResult.rows.map((certificate) => ({
              id: asCertificateId(certificate.certificate_id),
              name: certificate.name,
              year: certificate.year,
            }))
          : emptyVaultCollections().certificates,
      awards:
        awardResult.rows.length > 0
          ? awardResult.rows.map((award) => ({
              id: asAwardId(award.award_id),
              name: award.name,
              desc: award.description,
            }))
          : emptyVaultCollections().awards,
    };
  }

  async loadSavedResumes(userId: VaultBackendUserId): Promise<SavedResume[]> {
    const [
      resumeResult,
      projectLinks,
      skillLinks,
      experienceLinks,
      certificateLinks,
      awardLinks,
    ] =
      await Promise.all([
        query<ResumeRow>(
          `
            SELECT
              r.resume_id,
              r.version_name,
              r.target_job_title,
              r.target_company,
              r.status,
              r.updated_at,
              rb.summary
            FROM resumes r
            LEFT JOIN resume_basics rb ON rb.resume_id = r.resume_id
            WHERE r.user_id = $1
            ORDER BY r.updated_at DESC
          `,
          [userId],
        ),
        query<CompositionLinkRow>(
          `
            SELECT resume_id, project_id AS entity_id
            FROM resume_projects
            WHERE resume_id IN (
              SELECT resume_id FROM resumes WHERE user_id = $1
            )
          `,
          [userId],
        ),
        query<CompositionLinkRow>(
          `
            SELECT resume_id, skill_id AS entity_id
            FROM resume_skills
            WHERE resume_id IN (
              SELECT resume_id FROM resumes WHERE user_id = $1
            )
          `,
          [userId],
        ),
        query<CompositionLinkRow>(
          `
            SELECT resume_id, experience_id AS entity_id
            FROM resume_experiences
            WHERE resume_id IN (
              SELECT resume_id FROM resumes WHERE user_id = $1
            )
          `,
          [userId],
        ),
        query<CompositionLinkRow>(
          `
            SELECT resume_id, certificate_id AS entity_id
            FROM resume_certificates
            WHERE resume_id IN (
              SELECT resume_id FROM resumes WHERE user_id = $1
            )
          `,
          [userId],
        ),
        query<CompositionLinkRow>(
          `
            SELECT resume_id, award_id AS entity_id
            FROM resume_awards
            WHERE resume_id IN (
              SELECT resume_id FROM resumes WHERE user_id = $1
            )
          `,
          [userId],
        ),
      ]);
    const projectMap = mapCompositionRows(projectLinks.rows);
    const skillMap = mapCompositionRows(skillLinks.rows);
    const experienceMap = mapCompositionRows(experienceLinks.rows);
    const certificateMap = mapCompositionRows(certificateLinks.rows);
    const awardMap = mapCompositionRows(awardLinks.rows);

    return resumeResult.rows.map((resume) =>
      toSavedResume({
        resumeId: resume.resume_id,
        title: resume.version_name,
        targetJobTitle: resume.target_job_title,
        targetCompany: resume.target_company,
        summary: resume.summary,
        visibility: resume.visibility ?? "private",
        status: resume.status,
        updatedAt: resume.updated_at,
        projectIds: projectMap.get(resume.resume_id) ?? [],
        skillIds: skillMap.get(resume.resume_id) ?? [],
        experienceIds: experienceMap.get(resume.resume_id) ?? [],
        certificateIds: certificateMap.get(resume.resume_id) ?? [],
        awardIds: awardMap.get(resume.resume_id) ?? [],
      }),
    );
  }

  async getSavedResumeById(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
  ): Promise<SavedResume | null> {
    const savedResumes = await this.loadSavedResumes(userId);
    return savedResumes.find((resume) => resume.id === resumeId) ?? null;
  }

  async createSkill(
    userId: VaultBackendUserId,
    input: { category: string; name: string },
  ): Promise<VaultSkill> {
    return withTransaction(async (client) => {
      const skillResult = await client.query<SkillRow>(
        `
          INSERT INTO skills (name, category)
          VALUES ($1, $2)
          ON CONFLICT (name)
          DO UPDATE SET category = EXCLUDED.category
          RETURNING skill_id, name, category
        `,
        [input.name.trim(), input.category.trim()],
      );
      const skill = requireSingleRow(skillResult.rows, "Failed to create skill");

      await client.query(
        `
          INSERT INTO user_skills (user_id, skill_id, proficiency_level)
          VALUES ($1, $2, 'Intermediate')
          ON CONFLICT (user_id, skill_id)
          DO NOTHING
        `,
        [userId, skill.skill_id],
      );

      return {
        id: asSkillId(skill.skill_id),
        name: skill.name,
        category: skill.category,
      };
    });
  }

  async createProject(
    userId: VaultBackendUserId,
    input: NewProjectDraft,
  ): Promise<VaultProject> {
    const result = await query<{
      description: string | null;
      project_id: string;
      title: string;
    }>(
      `
        INSERT INTO projects (user_id, title, description, status, is_active, updated_at)
        VALUES ($1, $2, $3, 'Completed', true, CURRENT_TIMESTAMP)
        RETURNING project_id, title, description
      `,
      [userId, input.title.trim(), input.description.trim()],
    );
    const project = requireSingleRow(result.rows, "Failed to create project");

    return {
      id: asProjectId(project.project_id),
      title: project.title,
      duration: "",
      projectUrl: "",
      description: project.description ?? "",
    };
  }

  async updateProject(): Promise<VaultProject> { throw new Error("Not implemented"); }
  async deleteProject(): Promise<boolean> { throw new Error("Not implemented"); }
  async updateSkill(): Promise<VaultSkill> { throw new Error("Not implemented"); }
  async deleteSkill(): Promise<boolean> { throw new Error("Not implemented"); }

  async createExperience(): Promise<import("@uaps/shared/resume-builder").VaultExperience> { throw new Error("Not implemented"); }
  async updateExperience(): Promise<import("@uaps/shared/resume-builder").VaultExperience> { throw new Error("Not implemented"); }
  async deleteExperience(): Promise<boolean> { throw new Error("Not implemented"); }

  async createCertificate(): Promise<import("@uaps/shared/resume-builder").VaultCertificate> { throw new Error("Not implemented"); }
  async updateCertificate(): Promise<import("@uaps/shared/resume-builder").VaultCertificate> { throw new Error("Not implemented"); }
  async deleteCertificate(): Promise<boolean> { throw new Error("Not implemented"); }

  async createAward(): Promise<import("@uaps/shared/resume-builder").VaultAward> { throw new Error("Not implemented"); }
  async updateAward(): Promise<import("@uaps/shared/resume-builder").VaultAward> { throw new Error("Not implemented"); }
  async deleteAward(): Promise<boolean> { throw new Error("Not implemented"); }

  async saveResume(
    userId: VaultBackendUserId,
    input: UpsertSavedResumeInput,
  ): Promise<SavedResume> {
    return withTransaction(async (client) => {
      const persistedStatus = toPersistedResumeStatus(input.status);
      const resumeResult = input.resumeId
        ? await client.query<ResumeRow>(
            `
              UPDATE resumes
              SET
                version_name = $1,
                target_job_title = $2,
                target_company = $3,
                status = $4,
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = $5 AND resume_id = $6
              RETURNING resume_id, version_name, target_job_title, target_company, status, updated_at, NULL::text AS summary
            `,
            [
              input.title,
              input.config.targetRole || null,
              input.config.targetCompany || null,
              persistedStatus,
              userId,
              String(input.resumeId),
            ],
          )
        : await client.query<ResumeRow>(
            `
              INSERT INTO resumes (
                user_id,
                version_name,
                target_job_title,
                target_company,
                visibility,
                is_active,
                status,
                updated_at
              )
              VALUES ($1, $2, $3, $4, 'private', false, $5, CURRENT_TIMESTAMP)
              RETURNING resume_id, version_name, target_job_title, target_company, status, updated_at, NULL::text AS summary
            `,
            [
              userId,
              input.title,
              input.config.targetRole || null,
              input.config.targetCompany || null,
              persistedStatus,
            ],
          );
      const resume = requireSingleRow(resumeResult.rows, "Failed to save resume");

      await upsertResumeBasic(client, userId, resume.resume_id, input.config.summary);
      await setResumeComposition(client, userId, resume.resume_id, input.config);

      return toSavedResume({
        resumeId: resume.resume_id,
        title: resume.version_name,
        targetJobTitle: resume.target_job_title,
        targetCompany: resume.target_company,
        summary: input.config.summary,
        visibility: resume.visibility ?? "private",
        status: resume.status,
        updatedAt: resume.updated_at,
        projectIds: input.config.selectedProjects.map(String),
        skillIds: input.config.selectedSkills.map(String),
        experienceIds: input.config.selectedExperience.map(String),
        certificateIds: input.config.selectedCerts.map(String),
        awardIds: input.config.selectedAwards.map(String),
      });
    });
  }

  async duplicateResume(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    const existingResume = await this.getSavedResumeById(userId, resumeId);

    if (!existingResume) {
      return null;
    }

    const duplicatedResume = await this.saveResume(userId, {
      title: `${existingResume.title} (Copy)`,
      date: duplicatedAt,
      status: "Draft",
      config: existingResume.config,
    });

    return {
      ...duplicatedResume,
      date: duplicatedAt,
    };
  }

  async deleteResume(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
  ): Promise<boolean> {
    const result = await query<{ resume_id: string }>(
      `
        DELETE FROM resumes
        WHERE user_id = $1 AND resume_id = $2
        RETURNING resume_id
      `,
      [userId, String(resumeId)],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async updateResumeStatus(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    const existingResume = await this.getSavedResumeById(userId, resumeId);

    if (!existingResume) {
      return null;
    }

    return this.saveResume(userId, {
      resumeId,
      title: existingResume.title,
      date: existingResume.date,
      status,
      config: existingResume.config,
    });
  }

  async getPublicResumes(): Promise<import("@uaps/shared/resume-builder").SavedResume[]> { throw new Error("Not implemented"); }
  async updateResumeVisibility(userId: string, resumeId: import("@uaps/shared/resume-builder").ResumeId, visibility: string): Promise<import("@uaps/shared/resume-builder").SavedResume | null> { throw new Error("Not implemented"); }
}
