import { Pool } from "pg";
import type { PoolClient } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. API now uses PostgreSQL persistence.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

type GithubUser = {
  githubId: string;
  githubLogin: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type UserRow = {
  user_id: string;
  name: string;
  email: string;
  github_id: string;
  github_url: string | null;
};

type ProjectRow = {
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

type SkillRow = {
  skill_id: string;
  user_id: string;
  name: string;
  category: string;
  proficiency_level: string;
};

type ExperienceRow = {
  experience_id: string;
  user_id: string;
  organization: string;
  role: string;
  description: string | null;
  achievement: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

type ResumeRow = {
  resume_id: string;
  user_id: string;
  version_name: string;
  target_job_title: string | null;
  target_company: string | null;
  visibility: "private" | "public" | "company-only";
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

type ResumeBaselineRow = {
  resume_id: string;
  full_name: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  summary: string | null;
  updated_at: string;
};

export type Skill = {
  skillId: string;
  userId: string;
  name: string;
  category: string;
  proficiencyLevel: string;
};

export type Project = {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  repoURL?: string;
  isActive: boolean;
  status: string;
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Experience = {
  experienceId: string;
  userId: string;
  organization: string;
  role: string;
  description?: string;
  achievement?: string;
  startDate?: string;
  endDate?: string;
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Resume = {
  resumeId: string;
  userId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  visibility: "private" | "public" | "company-only";
  isActive: boolean;
  status: string;
  projectIds: string[];
  skillIds: string[];
  experienceIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ResumePreview = Resume & {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
};

export type ResumeBaseline = {
  resumeId: string;
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  summary?: string;
  updatedAt: string;
};

export type RecruiterResumeCard = {
  resumeId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  visibility: "public" | "company-only";
  status: string;
  updatedAt: string;
  ownerName: string;
  ownerGithubLogin?: string;
  skillNames: string[];
  baselineProgress: number;
  experienceYears: number;
};

export type RecruiterResumeQuickView = {
  resumeId: string;
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  visibility: "public" | "company-only";
  ownerName: string;
  ownerGithubLogin?: string;
  baseline?: {
    fullName: string;
    headline?: string;
    location?: string;
    summary?: string;
  };
  skills: Array<{ name: string; category: string }>;
  projects: Array<{ title: string; status: string; description?: string }>;
  experiences: Array<{ role: string; organization: string; achievement?: string }>;
  updatedAt: string;
};

export type ResumeAccessRequest = {
  accessRequestId: string;
  resumeId: string;
  resumeVersionName: string;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  purpose: string;
  positionTitle?: string;
  requestedVisibility: "read-only" | "export";
  requestStatus: "pending" | "approved" | "rejected" | "expired" | "revoked";
  createdAt: string;
  reviewedAt?: string;
};

type AccessRequestStatus = "pending" | "approved" | "rejected" | "expired" | "revoked";

export type ResumeAccessAuditLog = {
  auditId: string;
  resumeId: string;
  resumeVersionName: string;
  action: "view" | "export" | "request" | "approve" | "reject" | "revoke" | "blocked";
  recruiterEmail?: string;
  eventTime: string;
  metadata?: Record<string, unknown>;
};

const withClient = async <T>(runner: (client: PoolClient) => Promise<T>) => {
  const client = await pool.connect();

  try {
    return await runner(client);
  } finally {
    client.release();
  }
};

const withTransaction = async <T>(runner: (client: PoolClient) => Promise<T>) => {
  return await withClient(async (client) => {
    await client.query("BEGIN");

    try {
      const value = await runner(client);
      await client.query("COMMIT");
      return value;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
};

const toSkill = (row: SkillRow): Skill => ({
  skillId: row.skill_id,
  userId: row.user_id,
  name: row.name,
  category: row.category,
  proficiencyLevel: row.proficiency_level,
});

const toProject = (row: ProjectRow, skillIds: string[]): Project => ({
  projectId: row.project_id,
  userId: row.user_id,
  title: row.title,
  description: row.description ?? undefined,
  repoURL: row.repo_url ?? undefined,
  isActive: row.is_active,
  status: row.status,
  skillIds,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toExperience = (row: ExperienceRow, skillIds: string[]): Experience => ({
  experienceId: row.experience_id,
  userId: row.user_id,
  organization: row.organization,
  role: row.role,
  description: row.description ?? undefined,
  achievement: row.achievement ?? undefined,
  startDate: row.start_date ?? undefined,
  endDate: row.end_date ?? undefined,
  skillIds,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toResume = (
  row: ResumeRow,
  projectIds: string[],
  skillIds: string[],
  experienceIds: string[],
): Resume => ({
  resumeId: row.resume_id,
  userId: row.user_id,
  versionName: row.version_name,
  targetJobTitle: row.target_job_title ?? undefined,
  targetCompany: row.target_company ?? undefined,
  visibility: row.visibility,
  isActive: row.is_active,
  status: row.status,
  projectIds,
  skillIds,
  experienceIds,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toResumeBaseline = (row: ResumeBaselineRow): ResumeBaseline => ({
  resumeId: row.resume_id,
  fullName: row.full_name,
  headline: row.headline ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  location: row.location ?? undefined,
  linkedinUrl: row.linkedin_url ?? undefined,
  portfolioUrl: row.portfolio_url ?? undefined,
  githubUrl: row.github_url ?? undefined,
  summary: row.summary ?? undefined,
  updatedAt: row.updated_at,
});

const mapSkillIdsByProject = async (userId: string) => {
  const rows = await pool.query<{ project_id: string; skill_id: string }>(
    `
      SELECT ps.project_id, ps.skill_id
      FROM project_skills ps
      JOIN projects p ON p.project_id = ps.project_id
      WHERE p.user_id = $1
    `,
    [userId],
  );

  const map = new Map<string, string[]>();
  for (const row of rows.rows) {
    const list = map.get(row.project_id) ?? [];
    list.push(row.skill_id);
    map.set(row.project_id, list);
  }

  return map;
};

const mapSkillIdsByExperience = async (userId: string) => {
  const rows = await pool.query<{ experience_id: string; skill_id: string }>(
    `
      SELECT es.experience_id, es.skill_id
      FROM experience_skills es
      JOIN experiences e ON e.experience_id = es.experience_id
      WHERE e.user_id = $1
    `,
    [userId],
  );

  const map = new Map<string, string[]>();
  for (const row of rows.rows) {
    const list = map.get(row.experience_id) ?? [];
    list.push(row.skill_id);
    map.set(row.experience_id, list);
  }

  return map;
};

const mapCompositionByResume = async (userId: string) => {
  const [projectRows, skillRows, experienceRows] = await Promise.all([
    pool.query<{ resume_id: string; project_id: string }>(
      `
        SELECT rp.resume_id, rp.project_id
        FROM resume_projects rp
        JOIN resumes r ON r.resume_id = rp.resume_id
        WHERE r.user_id = $1
      `,
      [userId],
    ),
    pool.query<{ resume_id: string; skill_id: string }>(
      `
        SELECT rs.resume_id, rs.skill_id
        FROM resume_skills rs
        JOIN resumes r ON r.resume_id = rs.resume_id
        WHERE r.user_id = $1
      `,
      [userId],
    ),
    pool.query<{ resume_id: string; experience_id: string }>(
      `
        SELECT re.resume_id, re.experience_id
        FROM resume_experiences re
        JOIN resumes r ON r.resume_id = re.resume_id
        WHERE r.user_id = $1
      `,
      [userId],
    ),
  ]);

  const projectMap = new Map<string, string[]>();
  const skillMap = new Map<string, string[]>();
  const experienceMap = new Map<string, string[]>();

  for (const row of projectRows.rows) {
    const list = projectMap.get(row.resume_id) ?? [];
    list.push(row.project_id);
    projectMap.set(row.resume_id, list);
  }

  for (const row of skillRows.rows) {
    const list = skillMap.get(row.resume_id) ?? [];
    list.push(row.skill_id);
    skillMap.set(row.resume_id, list);
  }

  for (const row of experienceRows.rows) {
    const list = experienceMap.get(row.resume_id) ?? [];
    list.push(row.experience_id);
    experienceMap.set(row.resume_id, list);
  }

  return {
    projectMap,
    skillMap,
    experienceMap,
  };
};

const sanitizeIds = (ids?: string[]) => [...new Set((ids ?? []).filter(Boolean))];

const setProjectSkills = async (client: PoolClient, userId: string, projectId: string, skillIds: string[]) => {
  await client.query(`DELETE FROM project_skills WHERE project_id = $1`, [projectId]);

  const safeIds = sanitizeIds(skillIds);
  if (safeIds.length === 0) {
    return;
  }

  await client.query(
    `
      INSERT INTO project_skills (project_id, skill_id)
      SELECT $1, s.skill_id
      FROM unnest($2::uuid[]) AS s(skill_id)
      JOIN user_skills us ON us.skill_id = s.skill_id
      WHERE us.user_id = $3
    `,
    [projectId, safeIds, userId],
  );
};

const setExperienceSkills = async (client: PoolClient, userId: string, experienceId: string, skillIds: string[]) => {
  await client.query(`DELETE FROM experience_skills WHERE experience_id = $1`, [experienceId]);

  const safeIds = sanitizeIds(skillIds);
  if (safeIds.length === 0) {
    return;
  }

  await client.query(
    `
      INSERT INTO experience_skills (experience_id, skill_id)
      SELECT $1, s.skill_id
      FROM unnest($2::uuid[]) AS s(skill_id)
      JOIN user_skills us ON us.skill_id = s.skill_id
      WHERE us.user_id = $3
    `,
    [experienceId, safeIds, userId],
  );
};

const setResumeComposition = async (
  client: PoolClient,
  userId: string,
  resumeId: string,
  payload: { projectIds: string[]; skillIds: string[]; experienceIds: string[] },
) => {
  await client.query(`DELETE FROM resume_projects WHERE resume_id = $1`, [resumeId]);
  await client.query(`DELETE FROM resume_skills WHERE resume_id = $1`, [resumeId]);
  await client.query(`DELETE FROM resume_experiences WHERE resume_id = $1`, [resumeId]);

  const projectIds = sanitizeIds(payload.projectIds);
  const skillIds = sanitizeIds(payload.skillIds);
  const experienceIds = sanitizeIds(payload.experienceIds);

  if (projectIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_projects (resume_id, project_id)
        SELECT $1, p.project_id
        FROM unnest($2::uuid[]) AS p(project_id)
        JOIN projects pr ON pr.project_id = p.project_id
        WHERE pr.user_id = $3
      `,
      [resumeId, projectIds, userId],
    );
  }

  if (skillIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_skills (resume_id, skill_id)
        SELECT $1, s.skill_id
        FROM unnest($2::uuid[]) AS s(skill_id)
        JOIN user_skills us ON us.skill_id = s.skill_id
        WHERE us.user_id = $3
      `,
      [resumeId, skillIds, userId],
    );
  }

  if (experienceIds.length > 0) {
    await client.query(
      `
        INSERT INTO resume_experiences (resume_id, experience_id)
        SELECT $1, e.experience_id
        FROM unnest($2::uuid[]) AS e(experience_id)
        JOIN experiences ex ON ex.experience_id = e.experience_id
        WHERE ex.user_id = $3
      `,
      [resumeId, experienceIds, userId],
    );
  }

  await client.query(`UPDATE resumes SET updated_at = CURRENT_TIMESTAMP WHERE resume_id = $1`, [resumeId]);
};

export const upsertUserFromGithub = async (githubUser: GithubUser) => {
  const query = `
    INSERT INTO users (
      name,
      email,
      github_id,
      github_url,
      github_login,
      avatar_url,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (github_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      github_url = EXCLUDED.github_url,
      github_login = EXCLUDED.github_login,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING user_id, name, email, github_id, github_url;
  `;

  const values = [
    githubUser.name,
    githubUser.email,
    githubUser.githubId,
    `https://github.com/${githubUser.githubLogin}`,
    githubUser.githubLogin,
    githubUser.avatarUrl ?? null,
  ];

  const result = await pool.query<UserRow>(query, values);
  return result.rows[0];
};

export const summarize = async (userId: string) => {
  const [projectCount, skillCount, experienceCount, resumeCount, activeResumeRow] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*)::text as count FROM projects WHERE user_id = $1`, [userId]),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text as count FROM user_skills WHERE user_id = $1`, [userId]),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text as count FROM experiences WHERE user_id = $1`, [userId]),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text as count FROM resumes WHERE user_id = $1`, [userId]),
    pool.query<ResumeRow>(`SELECT * FROM resumes WHERE user_id = $1 AND is_active = true LIMIT 1`, [userId]),
  ]);

  const activeResume = activeResumeRow.rows[0] ? await getResumeById(userId, activeResumeRow.rows[0].resume_id) : null;

  return {
    counts: {
      projects: Number(projectCount.rows[0]?.count ?? 0),
      skills: Number(skillCount.rows[0]?.count ?? 0),
      experiences: Number(experienceCount.rows[0]?.count ?? 0),
      resumes: Number(resumeCount.rows[0]?.count ?? 0),
    },
    activeResume,
  };
};

export const listSkills = async (userId: string) => {
  const result = await pool.query<SkillRow>(
    `
      SELECT s.skill_id, us.user_id, s.name, s.category, us.proficiency_level
      FROM user_skills us
      JOIN skills s ON s.skill_id = us.skill_id
      WHERE us.user_id = $1
      ORDER BY s.name ASC
    `,
    [userId],
  );

  return result.rows.map(toSkill);
};

export const getSkillByIds = async (userId: string, ids: string[]) => {
  const safeIds = sanitizeIds(ids);
  if (safeIds.length === 0) {
    return [];
  }

  const result = await pool.query<SkillRow>(
    `
      SELECT s.skill_id, us.user_id, s.name, s.category, us.proficiency_level
      FROM user_skills us
      JOIN skills s ON s.skill_id = us.skill_id
      WHERE us.user_id = $1 AND s.skill_id = ANY($2::uuid[])
      ORDER BY s.name ASC
    `,
    [userId, safeIds],
  );

  return result.rows.map(toSkill);
};

export const createSkill = async (userId: string, input: { name: string; category: string; proficiencyLevel?: string }) => {
  return await withTransaction(async (client) => {
    const skillResult = await client.query<{ skill_id: string; name: string; category: string }>(
      `
        INSERT INTO skills (name, category)
        VALUES ($1, $2)
        ON CONFLICT (name)
        DO UPDATE SET category = EXCLUDED.category
        RETURNING skill_id, name, category
      `,
      [input.name.trim(), input.category.trim()],
    );

    const skill = skillResult.rows[0];
    if (!skill) {
      throw new Error("Failed to upsert skill");
    }

    await client.query(
      `
        INSERT INTO user_skills (user_id, skill_id, proficiency_level)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, skill_id)
        DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level
      `,
      [userId, skill.skill_id, input.proficiencyLevel ?? "Intermediate"],
    );

    return {
      skillId: skill.skill_id,
      userId,
      name: skill.name,
      category: skill.category,
      proficiencyLevel: input.proficiencyLevel ?? "Intermediate",
    } as Skill;
  });
};

export const updateSkill = async (
  userId: string,
  skillId: string,
  input: { name: string; category: string; proficiencyLevel?: string },
) => {
  return await withTransaction(async (client) => {
    const ownership = await client.query(`SELECT 1 FROM user_skills WHERE user_id = $1 AND skill_id = $2`, [userId, skillId]);
    if (!ownership.rows[0]) {
      return null;
    }

    const skillResult = await client.query<{ skill_id: string; name: string; category: string }>(
      `
        UPDATE skills
        SET name = $1, category = $2
        WHERE skill_id = $3
        RETURNING skill_id, name, category
      `,
      [input.name.trim(), input.category.trim(), skillId],
    );

    const skill = skillResult.rows[0];
    if (!skill) {
      return null;
    }

    await client.query(
      `
        UPDATE user_skills
        SET proficiency_level = $3
        WHERE user_id = $1 AND skill_id = $2
      `,
      [userId, skillId, input.proficiencyLevel ?? "Intermediate"],
    );

    return {
      skillId: skill.skill_id,
      userId,
      name: skill.name,
      category: skill.category,
      proficiencyLevel: input.proficiencyLevel ?? "Intermediate",
    } as Skill;
  });
};

export const deleteSkill = async (userId: string, skillId: string) => {
  const result = await withTransaction(async (client) => {
    await client.query(
      `
        DELETE FROM resume_skills
        WHERE resume_id IN (SELECT resume_id FROM resumes WHERE user_id = $1)
          AND skill_id = $2
      `,
      [userId, skillId],
    );

    await client.query(
      `
        DELETE FROM project_skills
        WHERE project_id IN (SELECT project_id FROM projects WHERE user_id = $1)
          AND skill_id = $2
      `,
      [userId, skillId],
    );

    await client.query(
      `
        DELETE FROM experience_skills
        WHERE experience_id IN (SELECT experience_id FROM experiences WHERE user_id = $1)
          AND skill_id = $2
      `,
      [userId, skillId],
    );

    return await client.query(`DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2 RETURNING skill_id`, [
      userId,
      skillId,
    ]);
  });

  return Boolean(result.rows[0]);
};

export const listProjects = async (userId: string) => {
  const [projectsResult, skillMap] = await Promise.all([
    pool.query<ProjectRow>(`SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`, [userId]),
    mapSkillIdsByProject(userId),
  ]);

  return projectsResult.rows.map((row) => toProject(row, skillMap.get(row.project_id) ?? []));
};

export const getProjectByIds = async (userId: string, ids: string[]) => {
  const safeIds = sanitizeIds(ids);
  if (safeIds.length === 0) {
    return [];
  }

  const [projectsResult, skillMap] = await Promise.all([
    pool.query<ProjectRow>(
      `
        SELECT * FROM projects
        WHERE user_id = $1 AND project_id = ANY($2::uuid[])
        ORDER BY created_at DESC
      `,
      [userId, safeIds],
    ),
    mapSkillIdsByProject(userId),
  ]);

  return projectsResult.rows.map((row) => toProject(row, skillMap.get(row.project_id) ?? []));
};

export const createProject = async (
  userId: string,
  input: {
    title: string;
    description?: string;
    repoURL?: string;
    status?: string;
    isActive?: boolean;
    skillIds?: string[];
  },
) => {
  return await withTransaction(async (client) => {
    const projectResult = await client.query<ProjectRow>(
      `
        INSERT INTO projects (
          user_id,
          title,
          description,
          repo_url,
          is_active,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      [
        userId,
        input.title,
        input.description ?? null,
        input.repoURL ?? null,
        input.isActive ?? true,
        input.status ?? "Completed",
      ],
    );

    const project = projectResult.rows[0];
    if (!project) {
      throw new Error("Failed to create project");
    }

    await setProjectSkills(client, userId, project.project_id, input.skillIds ?? []);

    const skillRows = await client.query<{ skill_id: string }>(
      `SELECT skill_id FROM project_skills WHERE project_id = $1 ORDER BY skill_id ASC`,
      [project.project_id],
    );

    return toProject(
      project,
      skillRows.rows.map((row) => row.skill_id),
    );
  });
};

export const updateProject = async (
  userId: string,
  projectId: string,
  input: {
    title: string;
    description?: string;
    repoURL?: string;
    status?: string;
    isActive?: boolean;
    skillIds?: string[];
  },
) => {
  return await withTransaction(async (client) => {
    const projectResult = await client.query<ProjectRow>(
      `
        UPDATE projects
        SET
          title = $3,
          description = $4,
          repo_url = $5,
          is_active = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND project_id = $2
        RETURNING *
      `,
      [
        userId,
        projectId,
        input.title,
        input.description ?? null,
        input.repoURL ?? null,
        input.isActive ?? true,
        input.status ?? "Completed",
      ],
    );

    const project = projectResult.rows[0];
    if (!project) {
      return null;
    }

    await setProjectSkills(client, userId, project.project_id, input.skillIds ?? []);

    const skillRows = await client.query<{ skill_id: string }>(
      `SELECT skill_id FROM project_skills WHERE project_id = $1 ORDER BY skill_id ASC`,
      [project.project_id],
    );

    return toProject(
      project,
      skillRows.rows.map((row) => row.skill_id),
    );
  });
};

export const deleteProject = async (userId: string, projectId: string) => {
  const result = await pool.query(
    `
      DELETE FROM projects
      WHERE user_id = $1 AND project_id = $2
      RETURNING project_id
    `,
    [userId, projectId],
  );

  return Boolean(result.rows[0]);
};

export const listExperiences = async (userId: string) => {
  const [experienceResult, skillMap] = await Promise.all([
    pool.query<ExperienceRow>(
      `SELECT * FROM experiences WHERE user_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      [userId],
    ),
    mapSkillIdsByExperience(userId),
  ]);

  return experienceResult.rows.map((row) => toExperience(row, skillMap.get(row.experience_id) ?? []));
};

export const getExperienceByIds = async (userId: string, ids: string[]) => {
  const safeIds = sanitizeIds(ids);
  if (safeIds.length === 0) {
    return [];
  }

  const [experienceResult, skillMap] = await Promise.all([
    pool.query<ExperienceRow>(
      `
        SELECT * FROM experiences
        WHERE user_id = $1 AND experience_id = ANY($2::uuid[])
        ORDER BY start_date DESC NULLS LAST, created_at DESC
      `,
      [userId, safeIds],
    ),
    mapSkillIdsByExperience(userId),
  ]);

  return experienceResult.rows.map((row) => toExperience(row, skillMap.get(row.experience_id) ?? []));
};

export const createExperience = async (
  userId: string,
  input: {
    organization: string;
    role: string;
    description?: string;
    achievement?: string;
    startDate?: string;
    endDate?: string;
    skillIds?: string[];
  },
) => {
  return await withTransaction(async (client) => {
    const result = await client.query<ExperienceRow>(
      `
        INSERT INTO experiences (
          user_id,
          organization,
          role,
          description,
          achievement,
          start_date,
          end_date,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      [
        userId,
        input.organization,
        input.role,
        input.description ?? null,
        input.achievement ?? null,
        input.startDate ?? null,
        input.endDate ?? null,
      ],
    );

    const experience = result.rows[0];
    if (!experience) {
      throw new Error("Failed to create experience");
    }

    await setExperienceSkills(client, userId, experience.experience_id, input.skillIds ?? []);

    const skillRows = await client.query<{ skill_id: string }>(
      `SELECT skill_id FROM experience_skills WHERE experience_id = $1 ORDER BY skill_id ASC`,
      [experience.experience_id],
    );

    return toExperience(
      experience,
      skillRows.rows.map((row) => row.skill_id),
    );
  });
};

export const updateExperience = async (
  userId: string,
  experienceId: string,
  input: {
    organization: string;
    role: string;
    description?: string;
    achievement?: string;
    startDate?: string;
    endDate?: string;
    skillIds?: string[];
  },
) => {
  return await withTransaction(async (client) => {
    const result = await client.query<ExperienceRow>(
      `
        UPDATE experiences
        SET
          organization = $3,
          role = $4,
          description = $5,
          achievement = $6,
          start_date = $7,
          end_date = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND experience_id = $2
        RETURNING *
      `,
      [
        userId,
        experienceId,
        input.organization,
        input.role,
        input.description ?? null,
        input.achievement ?? null,
        input.startDate ?? null,
        input.endDate ?? null,
      ],
    );

    const experience = result.rows[0];
    if (!experience) {
      return null;
    }

    await setExperienceSkills(client, userId, experience.experience_id, input.skillIds ?? []);

    const skillRows = await client.query<{ skill_id: string }>(
      `SELECT skill_id FROM experience_skills WHERE experience_id = $1 ORDER BY skill_id ASC`,
      [experience.experience_id],
    );

    return toExperience(
      experience,
      skillRows.rows.map((row) => row.skill_id),
    );
  });
};

export const deleteExperience = async (userId: string, experienceId: string) => {
  const result = await pool.query(
    `
      DELETE FROM experiences
      WHERE user_id = $1 AND experience_id = $2
      RETURNING experience_id
    `,
    [userId, experienceId],
  );

  return Boolean(result.rows[0]);
};

export const listResumes = async (userId: string) => {
  const [resumeRows, composition] = await Promise.all([
    pool.query<ResumeRow>(`SELECT * FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC`, [userId]),
    mapCompositionByResume(userId),
  ]);

  return resumeRows.rows.map((row) =>
    toResume(
      row,
      composition.projectMap.get(row.resume_id) ?? [],
      composition.skillMap.get(row.resume_id) ?? [],
      composition.experienceMap.get(row.resume_id) ?? [],
    ),
  );
};

export const getResumeById = async (userId: string, resumeId: string) => {
  const [rowResult, composition] = await Promise.all([
    pool.query<ResumeRow>(
      `
        SELECT * FROM resumes
        WHERE user_id = $1 AND resume_id = $2
        LIMIT 1
      `,
      [userId, resumeId],
    ),
    mapCompositionByResume(userId),
  ]);

  const row = rowResult.rows[0];
  if (!row) {
    return null;
  }

  return toResume(
    row,
    composition.projectMap.get(row.resume_id) ?? [],
    composition.skillMap.get(row.resume_id) ?? [],
    composition.experienceMap.get(row.resume_id) ?? [],
  );
};

export const createResume = async (
  userId: string,
  input: {
    versionName: string;
    targetJobTitle?: string;
    targetCompany?: string;
    visibility?: "private" | "public" | "company-only";
    status?: string;
    isActive?: boolean;
  },
) => {
  const result = await pool.query<ResumeRow>(
    `
      INSERT INTO resumes (
        user_id,
        version_name,
        target_job_title,
        target_company,
        visibility,
        is_active,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `,
    [
      userId,
      input.versionName,
      input.targetJobTitle ?? null,
      input.targetCompany ?? null,
      input.visibility ?? "private",
      input.isActive ?? false,
      input.status ?? "Draft",
    ],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create resume");
  }

  return toResume(row, [], [], []);
};

export const updateResume = async (
  userId: string,
  resumeId: string,
  input: {
    versionName: string;
    targetJobTitle?: string;
    targetCompany?: string;
    visibility?: "private" | "public" | "company-only";
    status?: string;
    isActive?: boolean;
  },
) => {
  return await withTransaction(async (client) => {
    if (input.isActive) {
      await client.query(`UPDATE resumes SET is_active = false WHERE user_id = $1`, [userId]);
    }

    const result = await client.query<ResumeRow>(
      `
        UPDATE resumes
        SET
          version_name = $3,
          target_job_title = $4,
          target_company = $5,
          visibility = $6,
          status = $7,
          is_active = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND resume_id = $2
        RETURNING *
      `,
      [
        userId,
        resumeId,
        input.versionName,
        input.targetJobTitle ?? null,
        input.targetCompany ?? null,
        input.visibility ?? "private",
        input.status ?? "Draft",
        input.isActive ?? false,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const composition = await mapCompositionByResume(userId);
    return toResume(
      row,
      composition.projectMap.get(row.resume_id) ?? [],
      composition.skillMap.get(row.resume_id) ?? [],
      composition.experienceMap.get(row.resume_id) ?? [],
    );
  });
};

export const deleteResume = async (userId: string, resumeId: string) => {
  const result = await pool.query(
    `
      DELETE FROM resumes
      WHERE user_id = $1 AND resume_id = $2
      RETURNING resume_id
    `,
    [userId, resumeId],
  );

  return Boolean(result.rows[0]);
};

export const updateResumeComposition = async (
  userId: string,
  resumeId: string,
  payload: { projectIds: string[]; skillIds: string[]; experienceIds: string[] },
) => {
  return await withTransaction(async (client) => {
    const ownership = await client.query(`SELECT 1 FROM resumes WHERE user_id = $1 AND resume_id = $2`, [userId, resumeId]);
    if (!ownership.rows[0]) {
      return null;
    }

    await setResumeComposition(client, userId, resumeId, payload);
    return await getResumeById(userId, resumeId);
  });
};

export const getResumePreview = async (userId: string, resumeId: string): Promise<ResumePreview | null> => {
  const resume = await getResumeById(userId, resumeId);
  if (!resume) {
    return null;
  }

  const [projects, skills, experiences] = await Promise.all([
    getProjectByIds(userId, resume.projectIds),
    getSkillByIds(userId, resume.skillIds),
    getExperienceByIds(userId, resume.experienceIds),
  ]);

  return {
    ...resume,
    projects,
    skills,
    experiences,
  };
};

export const getResumeBaseline = async (userId: string, resumeId: string): Promise<ResumeBaseline | null> => {
  const result = await pool.query<ResumeBaselineRow>(
    `
      SELECT rb.*
      FROM resume_basics rb
      JOIN resumes r ON r.resume_id = rb.resume_id
      WHERE r.user_id = $1 AND r.resume_id = $2
      LIMIT 1
    `,
    [userId, resumeId],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return toResumeBaseline(row);
};

export const upsertResumeBaseline = async (
  userId: string,
  resumeId: string,
  input: {
    fullName: string;
    headline?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    summary?: string;
  },
): Promise<ResumeBaseline | null> => {
  return await withTransaction(async (client) => {
    const ownership = await client.query(`SELECT 1 FROM resumes WHERE user_id = $1 AND resume_id = $2`, [userId, resumeId]);
    if (!ownership.rows[0]) {
      return null;
    }

    const upserted = await client.query<ResumeBaselineRow>(
      `
        INSERT INTO resume_basics (
          resume_id,
          full_name,
          headline,
          email,
          phone,
          location,
          linkedin_url,
          portfolio_url,
          github_url,
          summary,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (resume_id)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          headline = EXCLUDED.headline,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          linkedin_url = EXCLUDED.linkedin_url,
          portfolio_url = EXCLUDED.portfolio_url,
          github_url = EXCLUDED.github_url,
          summary = EXCLUDED.summary,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
      [
        resumeId,
        input.fullName.trim(),
        input.headline?.trim() || null,
        input.email?.trim() || null,
        input.phone?.trim() || null,
        input.location?.trim() || null,
        input.linkedinUrl?.trim() || null,
        input.portfolioUrl?.trim() || null,
        input.githubUrl?.trim() || null,
        input.summary?.trim() || null,
      ],
    );

    const row = upserted.rows[0];
    if (!row) {
      throw new Error("Failed to upsert resume baseline");
    }

    return toResumeBaseline(row);
  });
};

export const listRecruiterVisibleResumes = async (filters: {
  jobTitle?: string;
  requiredSkills?: string[];
  experienceKeyword?: string;
  minExperienceYears?: number;
  visibility?: "public" | "company-only";
}) => {
  const requiredSkills = [...new Set((filters.requiredSkills ?? []).map((item) => item.trim()).filter(Boolean))];
  const visibilityFilter = filters.visibility ? [filters.visibility] : ["public", "company-only"];

  const result = await pool.query<{
    resume_id: string;
    version_name: string;
    target_job_title: string | null;
    target_company: string | null;
    visibility: "public" | "company-only";
    status: string;
    updated_at: string;
    owner_name: string;
    github_login: string | null;
    skill_names: string[] | null;
    baseline_progress: number;
    experience_years: number;
  }>(
    `
      SELECT
        r.resume_id,
        r.version_name,
        r.target_job_title,
        r.target_company,
        r.visibility,
        r.status,
        r.updated_at,
        u.name AS owner_name,
        u.github_login,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.name), NULL) AS skill_names,
        (
          (
            CASE WHEN rb.full_name IS NOT NULL AND btrim(rb.full_name) <> '' THEN 1 ELSE 0 END +
            CASE WHEN rb.headline IS NOT NULL AND btrim(rb.headline) <> '' THEN 1 ELSE 0 END +
            CASE WHEN rb.summary IS NOT NULL AND btrim(rb.summary) <> '' THEN 1 ELSE 0 END +
            CASE WHEN rb.location IS NOT NULL AND btrim(rb.location) <> '' THEN 1 ELSE 0 END +
            CASE WHEN (
              (rb.email IS NOT NULL AND btrim(rb.email) <> '') OR
              (rb.phone IS NOT NULL AND btrim(rb.phone) <> '') OR
              (rb.linkedin_url IS NOT NULL AND btrim(rb.linkedin_url) <> '') OR
              (rb.github_url IS NOT NULL AND btrim(rb.github_url) <> '')
            ) THEN 1 ELSE 0 END
          ) * 20
        )::int AS baseline_progress,
        COALESCE(exp_stats.experience_years, 0)::numeric AS experience_years
      FROM resumes r
      JOIN users u ON u.user_id = r.user_id
      LEFT JOIN resume_skills rs ON rs.resume_id = r.resume_id
      LEFT JOIN skills s ON s.skill_id = rs.skill_id
      LEFT JOIN resume_basics rb ON rb.resume_id = r.resume_id
      LEFT JOIN LATERAL (
        SELECT ROUND(COALESCE(SUM(
          GREATEST(
            EXTRACT(EPOCH FROM (COALESCE(e.end_date::timestamp, CURRENT_TIMESTAMP) - COALESCE(e.start_date::timestamp, CURRENT_TIMESTAMP))) / 31557600,
            0
          )
        ), 0)::numeric, 2) AS experience_years
        FROM resume_experiences re
        JOIN experiences e ON e.experience_id = re.experience_id
        WHERE re.resume_id = r.resume_id
      ) exp_stats ON true
      WHERE r.visibility = ANY($1::text[])
        AND r.status = 'Published'
        AND ($2::text IS NULL OR r.target_job_title ILIKE '%' || $2 || '%')
        AND ($3::numeric IS NULL OR COALESCE(exp_stats.experience_years, 0) >= $3::numeric)
        AND (
          $4::text IS NULL
          OR EXISTS (
            SELECT 1
            FROM resume_experiences re2
            JOIN experiences e2 ON e2.experience_id = re2.experience_id
            WHERE re2.resume_id = r.resume_id
              AND (
                e2.organization ILIKE '%' || $4 || '%'
                OR e2.role ILIKE '%' || $4 || '%'
                OR COALESCE(e2.description, '') ILIKE '%' || $4 || '%'
                OR COALESCE(e2.achievement, '') ILIKE '%' || $4 || '%'
              )
          )
        )
        AND (
          $5::text[] IS NULL
          OR cardinality($5::text[]) = 0
          OR (
            SELECT COUNT(DISTINCT lower(s2.name))
            FROM resume_skills rs2
            JOIN skills s2 ON s2.skill_id = rs2.skill_id
            WHERE rs2.resume_id = r.resume_id
              AND lower(s2.name) = ANY($5::text[])
          ) = cardinality($5::text[])
        )
      GROUP BY r.resume_id, u.user_id, rb.resume_id, exp_stats.experience_years
      ORDER BY r.updated_at DESC
    `,
    [
      visibilityFilter,
      filters.jobTitle?.trim() || null,
      filters.minExperienceYears ?? null,
      filters.experienceKeyword?.trim() || null,
      requiredSkills.length > 0 ? requiredSkills.map((item) => item.toLowerCase()) : null,
    ],
  );

  return result.rows.map((row) => ({
    resumeId: row.resume_id,
    versionName: row.version_name,
    targetJobTitle: row.target_job_title ?? undefined,
    targetCompany: row.target_company ?? undefined,
    visibility: row.visibility,
    status: row.status,
    updatedAt: row.updated_at,
    ownerName: row.owner_name,
    ownerGithubLogin: row.github_login ?? undefined,
    skillNames: row.skill_names ?? [],
    baselineProgress: Number(row.baseline_progress ?? 0),
    experienceYears: Number(row.experience_years ?? 0),
  })) as RecruiterResumeCard[];
};

export const getRecruiterResumeQuickView = async (resumeId: string): Promise<RecruiterResumeQuickView | null> => {
  const resumeResult = await pool.query<{
    resume_id: string;
    version_name: string;
    target_job_title: string | null;
    target_company: string | null;
    visibility: "public" | "company-only";
    owner_name: string;
    github_login: string | null;
    updated_at: string;
    full_name: string | null;
    headline: string | null;
    location: string | null;
    summary: string | null;
  }>(
    `
      SELECT
        r.resume_id,
        r.version_name,
        r.target_job_title,
        r.target_company,
        r.visibility,
        u.name AS owner_name,
        u.github_login,
        r.updated_at,
        rb.full_name,
        rb.headline,
        rb.location,
        rb.summary
      FROM resumes r
      JOIN users u ON u.user_id = r.user_id
      LEFT JOIN resume_basics rb ON rb.resume_id = r.resume_id
      WHERE r.resume_id = $1
        AND r.status = 'Published'
        AND r.visibility IN ('public', 'company-only')
      LIMIT 1
    `,
    [resumeId],
  );

  const row = resumeResult.rows[0];
  if (!row) {
    return null;
  }

  const [skillsResult, projectsResult, experiencesResult] = await Promise.all([
    pool.query<{ name: string; category: string }>(
      `
        SELECT s.name, s.category
        FROM resume_skills rs
        JOIN skills s ON s.skill_id = rs.skill_id
        WHERE rs.resume_id = $1
        ORDER BY s.name ASC
      `,
      [resumeId],
    ),
    pool.query<{ title: string; status: string; description: string | null }>(
      `
        SELECT p.title, p.status, p.description
        FROM resume_projects rp
        JOIN projects p ON p.project_id = rp.project_id
        WHERE rp.resume_id = $1
        ORDER BY p.updated_at DESC
      `,
      [resumeId],
    ),
    pool.query<{ role: string; organization: string; achievement: string | null }>(
      `
        SELECT e.role, e.organization, e.achievement
        FROM resume_experiences re
        JOIN experiences e ON e.experience_id = re.experience_id
        WHERE re.resume_id = $1
        ORDER BY e.updated_at DESC
      `,
      [resumeId],
    ),
  ]);

  return {
    resumeId: row.resume_id,
    versionName: row.version_name,
    targetJobTitle: row.target_job_title ?? undefined,
    targetCompany: row.target_company ?? undefined,
    visibility: row.visibility,
    ownerName: row.owner_name,
    ownerGithubLogin: row.github_login ?? undefined,
    baseline: row.full_name
      ? {
          fullName: row.full_name,
          headline: row.headline ?? undefined,
          location: row.location ?? undefined,
          summary: row.summary ?? undefined,
        }
      : undefined,
    skills: skillsResult.rows,
    projects: projectsResult.rows.map((item) => ({
      title: item.title,
      status: item.status,
      description: item.description ?? undefined,
    })),
    experiences: experiencesResult.rows.map((item) => ({
      role: item.role,
      organization: item.organization,
      achievement: item.achievement ?? undefined,
    })),
    updatedAt: row.updated_at,
  };
};

const ensureRecruiterAccount = async (
  client: PoolClient,
  payload: {
    companyName: string;
    companyDomain?: string;
    recruiterName: string;
    recruiterEmail: string;
    recruiterRoleTitle?: string;
  },
) => {
  const normalizedDomain = payload.companyDomain?.trim().toLowerCase() || null;
  const normalizedEmail = payload.recruiterEmail.trim().toLowerCase();

  const existingRecruiter = await client.query<{ recruiter_id: string }>(
    `SELECT recruiter_id FROM recruiter_accounts WHERE email = $1 LIMIT 1`,
    [normalizedEmail],
  );

  if (existingRecruiter.rows[0]) {
    return existingRecruiter.rows[0].recruiter_id;
  }

  let companyId: string | null = null;

  if (normalizedDomain) {
    const existingCompany = await client.query<{ company_id: string }>(
      `SELECT company_id FROM companies WHERE domain = $1 LIMIT 1`,
      [normalizedDomain],
    );
    companyId = existingCompany.rows[0]?.company_id ?? null;
  }

  if (!companyId) {
    const createdCompany = await client.query<{ company_id: string }>(
      `
        INSERT INTO companies (legal_name, domain, verification_status, created_at, updated_at)
        VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING company_id
      `,
      [payload.companyName.trim(), normalizedDomain],
    );
    companyId = createdCompany.rows[0]?.company_id ?? null;
  }

  if (!companyId) {
    throw new Error("Failed to create recruiter company");
  }

  const recruiter = await client.query<{ recruiter_id: string }>(
    `
      INSERT INTO recruiter_accounts (
        company_id,
        full_name,
        email,
        role_title,
        is_email_verified,
        is_identity_verified,
        account_status,
        risk_level,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, false, false, 'pending', 'low', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING recruiter_id
    `,
    [companyId, payload.recruiterName.trim(), normalizedEmail, payload.recruiterRoleTitle?.trim() || null],
  );

  const recruiterId = recruiter.rows[0]?.recruiter_id;
  if (!recruiterId) {
    throw new Error("Failed to create recruiter account");
  }

  return recruiterId;
};

export const createResumeAccessRequest = async (payload: {
  resumeId: string;
  companyName: string;
  companyDomain?: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterRoleTitle?: string;
  purpose: string;
  positionTitle?: string;
  requestedVisibility?: "read-only" | "export";
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}) => {
  return await withTransaction(async (client) => {
    const resumeRow = await client.query<{ resume_id: string; visibility: string }>(
      `SELECT resume_id, visibility FROM resumes WHERE resume_id = $1 LIMIT 1`,
      [payload.resumeId],
    );

    const resume = resumeRow.rows[0];
    if (!resume || (resume.visibility !== "public" && resume.visibility !== "company-only")) {
      return null;
    }

    const recruiterId = await ensureRecruiterAccount(client, {
      companyName: payload.companyName,
      companyDomain: payload.companyDomain,
      recruiterName: payload.recruiterName,
      recruiterEmail: payload.recruiterEmail,
      recruiterRoleTitle: payload.recruiterRoleTitle,
    });

    const requestRow = await client.query<{
      access_request_id: string;
      resume_id: string;
      recruiter_id: string;
      purpose: string;
      position_title: string | null;
      requested_visibility: "read-only" | "export";
      request_status: AccessRequestStatus;
      created_at: string;
      reviewed_at: string | null;
    }>(
      `
        INSERT INTO resume_access_requests (
          resume_id,
          recruiter_id,
          purpose,
          position_title,
          requested_visibility,
          request_status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING access_request_id, resume_id, recruiter_id, purpose, position_title, requested_visibility, request_status, created_at, reviewed_at
      `,
      [
        payload.resumeId,
        recruiterId,
        payload.purpose.trim(),
        payload.positionTitle?.trim() || null,
        payload.requestedVisibility ?? "read-only",
      ],
    );

    const created = requestRow.rows[0];
    if (!created) {
      throw new Error("Failed to create access request");
    }

    await client.query(
      `
        INSERT INTO resume_access_audit_logs (
          resume_id,
          recruiter_id,
          access_request_id,
          action,
          ip_address,
          user_agent,
          referrer,
          event_time,
          metadata
        )
        VALUES ($1, $2, $3, 'request', NULLIF($4, '')::inet, $5, $6, CURRENT_TIMESTAMP, $7::jsonb)
      `,
      [
        payload.resumeId,
        recruiterId,
        created.access_request_id,
        payload.ipAddress ?? "",
        payload.userAgent ?? null,
        payload.referrer ?? null,
        JSON.stringify({
          requestedVisibility: created.requested_visibility,
          positionTitle: created.position_title,
          purpose: created.purpose,
        }),
      ],
    );

    return created.access_request_id;
  });
};

export const listOwnerAccessRequests = async (userId: string, status?: string) => {
  const result = await pool.query<{
    access_request_id: string;
    resume_id: string;
    version_name: string;
    recruiter_id: string;
    recruiter_name: string;
    recruiter_email: string;
    company_name: string;
    purpose: string;
    position_title: string | null;
    requested_visibility: "read-only" | "export";
    request_status: AccessRequestStatus;
    created_at: string;
    reviewed_at: string | null;
  }>(
    `
      SELECT
        req.access_request_id,
        req.resume_id,
        r.version_name,
        req.recruiter_id,
        rc.full_name AS recruiter_name,
        rc.email AS recruiter_email,
        c.legal_name AS company_name,
        req.purpose,
        req.position_title,
        req.requested_visibility,
        req.request_status,
        req.created_at,
        req.reviewed_at
      FROM resume_access_requests req
      JOIN resumes r ON r.resume_id = req.resume_id
      JOIN recruiter_accounts rc ON rc.recruiter_id = req.recruiter_id
      JOIN companies c ON c.company_id = rc.company_id
      WHERE r.user_id = $1
        AND ($2::text IS NULL OR req.request_status = $2)
      ORDER BY req.created_at DESC
    `,
    [userId, status?.trim() || null],
  );

  return result.rows.map((row) => ({
    accessRequestId: row.access_request_id,
    resumeId: row.resume_id,
    resumeVersionName: row.version_name,
    recruiterId: row.recruiter_id,
    recruiterName: row.recruiter_name,
    recruiterEmail: row.recruiter_email,
    companyName: row.company_name,
    purpose: row.purpose,
    positionTitle: row.position_title ?? undefined,
    requestedVisibility: row.requested_visibility,
    requestStatus: row.request_status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  })) as ResumeAccessRequest[];
};

export const reviewResumeAccessRequest = async (
  userId: string,
  accessRequestId: string,
  decision: "approve" | "reject",
  note?: string,
) => {
  return await withTransaction(async (client) => {
    const nextStatus = decision === "approve" ? "approved" : "rejected";

    const result = await client.query<{
      access_request_id: string;
      resume_id: string;
      recruiter_id: string;
      request_status: AccessRequestStatus;
    }>(
      `
        UPDATE resume_access_requests req
        SET
          request_status = $3,
          reviewed_by_user_id = $4,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP,
          expires_at = CASE WHEN $3 = 'approved' THEN CURRENT_TIMESTAMP + INTERVAL '30 days' ELSE req.expires_at END
        FROM resumes r
        WHERE req.resume_id = r.resume_id
          AND req.access_request_id = $1
          AND r.user_id = $2
          AND req.request_status = 'pending'
        RETURNING req.access_request_id, req.resume_id, req.recruiter_id, req.request_status
      `,
      [accessRequestId, userId, nextStatus, userId],
    );

    const reviewed = result.rows[0];
    if (!reviewed) {
      return null;
    }

    await client.query(
      `
        INSERT INTO resume_access_audit_logs (
          resume_id,
          recruiter_id,
          access_request_id,
          action,
          event_time,
          metadata
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5::jsonb)
      `,
      [
        reviewed.resume_id,
        reviewed.recruiter_id,
        reviewed.access_request_id,
        decision,
        JSON.stringify({ note: note?.trim() || null }),
      ],
    );

    return reviewed.access_request_id;
  });
};

export const listOwnerAccessAuditLogs = async (userId: string, resumeId?: string) => {
  const result = await pool.query<{
    audit_id: string;
    resume_id: string;
    version_name: string;
    action: "view" | "export" | "request" | "approve" | "reject" | "revoke" | "blocked";
    recruiter_email: string | null;
    event_time: string;
    metadata: Record<string, unknown> | null;
  }>(
    `
      SELECT
        l.audit_id,
        l.resume_id,
        r.version_name,
        l.action,
        rc.email AS recruiter_email,
        l.event_time,
        l.metadata
      FROM resume_access_audit_logs l
      JOIN resumes r ON r.resume_id = l.resume_id
      LEFT JOIN recruiter_accounts rc ON rc.recruiter_id = l.recruiter_id
      WHERE r.user_id = $1
        AND ($2::uuid IS NULL OR r.resume_id = $2::uuid)
      ORDER BY l.event_time DESC
      LIMIT 200
    `,
    [userId, resumeId ?? null],
  );

  return result.rows.map((row) => ({
    auditId: row.audit_id,
    resumeId: row.resume_id,
    resumeVersionName: row.version_name,
    action: row.action,
    recruiterEmail: row.recruiter_email ?? undefined,
    eventTime: row.event_time,
    metadata: row.metadata ?? undefined,
  })) as ResumeAccessAuditLog[];
};
