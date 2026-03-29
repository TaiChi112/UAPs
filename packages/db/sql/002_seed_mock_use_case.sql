-- Seed mock data for UAPS use-case demo.
-- Target user: most recently updated user in `users` table.
-- This script is idempotent and safe to rerun.

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
)
INSERT INTO skills (name, category)
VALUES
  ('TypeScript', 'Programming Language'),
  ('Elysia', 'Backend Framework'),
  ('Next.js', 'Frontend Framework'),
  ('PostgreSQL', 'Database'),
  ('Docker', 'DevOps'),
  ('OAuth 2.0', 'Authentication'),
  ('System Design', 'Architecture'),
  ('Python', 'Programming Language'),
  ('PyTorch', 'ML Framework'),
  ('TensorFlow', 'ML Framework'),
  ('Feature Engineering', 'Data Science'),
  ('MLOps', 'Machine Learning Ops'),
  ('MLflow', 'Experiment Tracking'),
  ('Prompt Engineering', 'Generative AI')
ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category;

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
),
skill_levels AS (
  SELECT *
  FROM (
    VALUES
      ('TypeScript', 'Advanced'),
      ('Elysia', 'Advanced'),
      ('Next.js', 'Advanced'),
      ('PostgreSQL', 'Intermediate'),
      ('Docker', 'Intermediate'),
      ('OAuth 2.0', 'Advanced'),
      ('System Design', 'Intermediate'),
      ('Python', 'Advanced'),
      ('PyTorch', 'Intermediate'),
      ('TensorFlow', 'Intermediate'),
      ('Feature Engineering', 'Advanced'),
      ('MLOps', 'Intermediate'),
      ('MLflow', 'Intermediate'),
      ('Prompt Engineering', 'Advanced')
  ) AS t(skill_name, proficiency_level)
)
INSERT INTO user_skills (user_id, skill_id, proficiency_level)
SELECT tu.user_id, s.skill_id, sl.proficiency_level
FROM target_user tu
JOIN skill_levels sl ON true
JOIN skills s ON s.name = sl.skill_name
ON CONFLICT (user_id, skill_id)
DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level;

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
)
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
SELECT
  tu.user_id,
  p.title,
  p.description,
  p.repo_url,
  p.is_active,
  p.status,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM target_user tu
CROSS JOIN (
  VALUES
    (
      'UAPS MVP Platform',
      'Built full-stack portfolio system with GitHub OAuth, CRUD management, resume composition, and export pipeline.',
      'https://github.com/TaiChi112/uaps-mvp',
      true,
      'Completed'
    ),
    (
      'Resume Export Renderer',
      'Implemented single-template markdown/svg rendering with PNG and PDF exports for consistent visual output.',
      'https://github.com/TaiChi112/uaps-exporter',
      true,
      'Completed'
    ),
    (
      'Auth Reliability Hardening',
      'Diagnosed OAuth edge cases and improved callback handling, token exchange visibility, and runtime diagnostics.',
      'https://github.com/TaiChi112/uaps-auth-hardening',
      true,
      'In Progress'
    ),
    (
      'Loan Default Prediction Pipeline',
      'Trained and deployed gradient boosting and neural baseline models for credit risk classification with experiment tracking.',
      'https://github.com/TaiChi112/loan-default-mlops',
      true,
      'Completed'
    ),
    (
      'Thai Resume Parser with LLM',
      'Built retrieval + LLM pipeline to parse Thai resumes into structured entities for recruiter search.',
      'https://github.com/TaiChi112/thai-resume-parser',
      true,
      'Completed'
    )
) AS p(title, description, repo_url, is_active, status)
WHERE NOT EXISTS (
  SELECT 1
  FROM projects x
  WHERE x.user_id = tu.user_id
    AND x.title = p.title
);

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
)
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
SELECT
  tu.user_id,
  e.organization,
  e.role,
  e.description,
  e.achievement,
  e.start_date,
  e.end_date,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM target_user tu
CROSS JOIN (
  VALUES
    (
      'University Software Lab',
      'Full-Stack Developer',
      'Developed web-based academic profile systems and data modeling features.',
      'Reduced manual resume preparation time by introducing reusable profile entities.',
      DATE '2025-08-01',
      NULL
    ),
    (
      'Student Innovation Team',
      'Backend Engineer',
      'Designed normalized PostgreSQL schemas and API integration patterns.',
      'Improved data consistency with M:N relation constraints and transaction-safe updates.',
      DATE '2025-01-15',
      DATE '2025-07-31'
    ),
    (
      'AI Research Studio',
      'AI Engineer Intern',
      'Built end-to-end ML experiments from feature engineering to model deployment monitoring.',
      'Improved model F1 score from 0.72 to 0.83 by feature pipeline redesign and proper drift checks.',
      DATE '2024-06-01',
      DATE '2024-12-31'
    )
) AS e(organization, role, description, achievement, start_date, end_date)
WHERE NOT EXISTS (
  SELECT 1
  FROM experiences x
  WHERE x.user_id = tu.user_id
    AND x.organization = e.organization
    AND x.role = e.role
);

-- Base resume first: common profile shell that can later be composed by attaching entities.
WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
)
INSERT INTO resumes (
  user_id,
  version_name,
  target_job_title,
  target_company,
  is_active,
  status,
  created_at,
  updated_at
)
SELECT
  tu.user_id,
  r.version_name,
  r.target_job_title,
  r.target_company,
  r.is_active,
  r.status,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM target_user tu
CROSS JOIN (
  VALUES
    ('Core Profile - Base (Private)', NULL, NULL, false, 'Draft'),
    ('Backend Engineer - FinTech Focus', 'Backend Engineer', 'FinTech Co.', true, 'Published'),
    ('AI Engineer - Applied ML Focus', 'AI Engineer', 'AI Product Co.', false, 'Published'),
    ('Full-Stack Engineer - Product Team', 'Full-Stack Engineer', 'SaaS Product Co.', false, 'Draft')
) AS r(version_name, target_job_title, target_company, is_active, status)
WHERE NOT EXISTS (
  SELECT 1
  FROM resumes x
  WHERE x.user_id = tu.user_id
    AND x.version_name = r.version_name
);

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
),
project_skill_map AS (
  SELECT *
  FROM (
    VALUES
      ('UAPS MVP Platform', 'TypeScript'),
      ('UAPS MVP Platform', 'Next.js'),
      ('UAPS MVP Platform', 'Elysia'),
      ('UAPS MVP Platform', 'PostgreSQL'),
      ('UAPS MVP Platform', 'OAuth 2.0'),
      ('Resume Export Renderer', 'TypeScript'),
      ('Resume Export Renderer', 'System Design'),
      ('Auth Reliability Hardening', 'OAuth 2.0'),
      ('Auth Reliability Hardening', 'Elysia'),
      ('Loan Default Prediction Pipeline', 'Python'),
      ('Loan Default Prediction Pipeline', 'Feature Engineering'),
      ('Loan Default Prediction Pipeline', 'MLOps'),
      ('Loan Default Prediction Pipeline', 'MLflow'),
      ('Thai Resume Parser with LLM', 'Python'),
      ('Thai Resume Parser with LLM', 'Prompt Engineering'),
      ('Thai Resume Parser with LLM', 'PyTorch')
  ) AS t(project_title, skill_name)
)
INSERT INTO project_skills (project_id, skill_id)
SELECT p.project_id, s.skill_id
FROM target_user tu
JOIN projects p ON p.user_id = tu.user_id
JOIN project_skill_map m ON m.project_title = p.title
JOIN skills s ON s.name = m.skill_name
ON CONFLICT (project_id, skill_id) DO NOTHING;

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
),
experience_skill_map AS (
  SELECT *
  FROM (
    VALUES
      ('University Software Lab', 'Full-Stack Developer', 'TypeScript'),
      ('University Software Lab', 'Full-Stack Developer', 'Next.js'),
      ('University Software Lab', 'Full-Stack Developer', 'Elysia'),
      ('Student Innovation Team', 'Backend Engineer', 'PostgreSQL'),
      ('Student Innovation Team', 'Backend Engineer', 'System Design'),
      ('AI Research Studio', 'AI Engineer Intern', 'Python'),
      ('AI Research Studio', 'AI Engineer Intern', 'TensorFlow'),
      ('AI Research Studio', 'AI Engineer Intern', 'Feature Engineering'),
      ('AI Research Studio', 'AI Engineer Intern', 'MLOps')
  ) AS t(organization, role, skill_name)
)
INSERT INTO experience_skills (experience_id, skill_id)
SELECT e.experience_id, s.skill_id
FROM target_user tu
JOIN experiences e ON e.user_id = tu.user_id
JOIN experience_skill_map m ON m.organization = e.organization AND m.role = e.role
JOIN skills s ON s.name = m.skill_name
ON CONFLICT (experience_id, skill_id) DO NOTHING;

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
),
resume_project_map AS (
  SELECT *
  FROM (
    VALUES
      ('Backend Engineer - FinTech Focus', 'UAPS MVP Platform'),
      ('Backend Engineer - FinTech Focus', 'Auth Reliability Hardening'),
      ('Full-Stack Engineer - Product Team', 'UAPS MVP Platform'),
      ('Full-Stack Engineer - Product Team', 'Resume Export Renderer'),
      ('AI Engineer - Applied ML Focus', 'Loan Default Prediction Pipeline'),
      ('AI Engineer - Applied ML Focus', 'Thai Resume Parser with LLM')
  ) AS t(resume_name, project_title)
)
INSERT INTO resume_projects (resume_id, project_id)
SELECT r.resume_id, p.project_id
FROM target_user tu
JOIN resumes r ON r.user_id = tu.user_id
JOIN resume_project_map m ON m.resume_name = r.version_name
JOIN projects p ON p.user_id = tu.user_id AND p.title = m.project_title
ON CONFLICT (resume_id, project_id) DO NOTHING;

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
),
resume_skill_map AS (
  SELECT *
  FROM (
    VALUES
      ('Backend Engineer - FinTech Focus', 'TypeScript'),
      ('Backend Engineer - FinTech Focus', 'Elysia'),
      ('Backend Engineer - FinTech Focus', 'PostgreSQL'),
      ('Backend Engineer - FinTech Focus', 'OAuth 2.0'),
      ('Full-Stack Engineer - Product Team', 'TypeScript'),
      ('Full-Stack Engineer - Product Team', 'Next.js'),
      ('Full-Stack Engineer - Product Team', 'Docker'),
      ('AI Engineer - Applied ML Focus', 'Python'),
      ('AI Engineer - Applied ML Focus', 'PyTorch'),
      ('AI Engineer - Applied ML Focus', 'TensorFlow'),
      ('AI Engineer - Applied ML Focus', 'MLOps'),
      ('AI Engineer - Applied ML Focus', 'Feature Engineering')
  ) AS t(resume_name, skill_name)
)
INSERT INTO resume_skills (resume_id, skill_id)
SELECT r.resume_id, s.skill_id
FROM target_user tu
JOIN resumes r ON r.user_id = tu.user_id
JOIN resume_skill_map m ON m.resume_name = r.version_name
JOIN skills s ON s.name = m.skill_name
ON CONFLICT (resume_id, skill_id) DO NOTHING;

WITH target_user AS (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
),
resume_experience_map AS (
  SELECT *
  FROM (
    VALUES
      ('Backend Engineer - FinTech Focus', 'Student Innovation Team', 'Backend Engineer'),
      ('Full-Stack Engineer - Product Team', 'University Software Lab', 'Full-Stack Developer'),
      ('AI Engineer - Applied ML Focus', 'AI Research Studio', 'AI Engineer Intern')
  ) AS t(resume_name, organization, role)
)
INSERT INTO resume_experiences (resume_id, experience_id)
SELECT r.resume_id, e.experience_id
FROM target_user tu
JOIN resumes r ON r.user_id = tu.user_id
JOIN resume_experience_map m ON m.resume_name = r.version_name
JOIN experiences e ON e.user_id = tu.user_id AND e.organization = m.organization AND e.role = m.role
ON CONFLICT (resume_id, experience_id) DO NOTHING;

UPDATE resumes r
SET is_active = CASE WHEN r.version_name = 'Backend Engineer - FinTech Focus' THEN true ELSE false END,
    updated_at = CURRENT_TIMESTAMP
WHERE r.user_id = (
  SELECT user_id
  FROM users
  ORDER BY updated_at DESC
  LIMIT 1
)
  AND r.version_name IN (
    'Core Profile - Base (Private)',
    'Backend Engineer - FinTech Focus',
    'AI Engineer - Applied ML Focus',
    'Full-Stack Engineer - Product Team'
  );
