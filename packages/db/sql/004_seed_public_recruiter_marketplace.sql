-- Seed additional public/company-only resumes for recruiter marketplace demo.
-- Idempotent script: safe to run multiple times.

-- 1) Ensure demo users exist.
INSERT INTO users (name, email, github_id, github_login, github_url, avatar_url, created_at, updated_at)
VALUES
  (
    'Napat Srisuk',
    'napat.backend.demo@uaps.local',
    'uaps-demo-backend-001',
    'napat-backend',
    'https://github.com/napat-backend',
    'https://avatars.githubusercontent.com/u/99111111?v=4',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Mali Chantarang',
    'mali.ai.demo@uaps.local',
    'uaps-demo-ai-001',
    'mali-ai',
    'https://github.com/mali-ai',
    'https://avatars.githubusercontent.com/u/99222222?v=4',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  github_id = EXCLUDED.github_id,
  github_login = EXCLUDED.github_login,
  github_url = EXCLUDED.github_url,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = CURRENT_TIMESTAMP;

-- 2) Ensure common skills exist.
INSERT INTO skills (name, category)
VALUES
  ('TypeScript', 'Programming Language'),
  ('Node.js', 'Runtime'),
  ('Go', 'Programming Language'),
  ('PostgreSQL', 'Database'),
  ('Redis', 'Database'),
  ('Kafka', 'Event Streaming'),
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('AWS', 'Cloud Platform'),
  ('Terraform', 'Infrastructure as Code'),
  ('Python', 'Programming Language'),
  ('PyTorch', 'ML Framework'),
  ('MLOps', 'Machine Learning Ops'),
  ('Feature Store', 'Data Platform'),
  ('LLM Evaluation', 'Generative AI'),
  ('Prompt Engineering', 'Generative AI')
ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category;

-- 3) Attach skill levels to each demo user.
WITH demo_users AS (
  SELECT user_id, email
  FROM users
  WHERE email IN ('napat.backend.demo@uaps.local', 'mali.ai.demo@uaps.local')
),
user_skill_levels AS (
  SELECT *
  FROM (
    VALUES
      ('napat.backend.demo@uaps.local', 'TypeScript', 'Advanced'),
      ('napat.backend.demo@uaps.local', 'Node.js', 'Expert'),
      ('napat.backend.demo@uaps.local', 'Go', 'Advanced'),
      ('napat.backend.demo@uaps.local', 'PostgreSQL', 'Advanced'),
      ('napat.backend.demo@uaps.local', 'Redis', 'Advanced'),
      ('napat.backend.demo@uaps.local', 'Kafka', 'Intermediate'),
      ('napat.backend.demo@uaps.local', 'Docker', 'Advanced'),
      ('napat.backend.demo@uaps.local', 'Kubernetes', 'Intermediate'),
      ('napat.backend.demo@uaps.local', 'AWS', 'Intermediate'),
      ('napat.backend.demo@uaps.local', 'Terraform', 'Intermediate'),
      ('mali.ai.demo@uaps.local', 'Python', 'Expert'),
      ('mali.ai.demo@uaps.local', 'PyTorch', 'Advanced'),
      ('mali.ai.demo@uaps.local', 'MLOps', 'Advanced'),
      ('mali.ai.demo@uaps.local', 'Feature Store', 'Advanced'),
      ('mali.ai.demo@uaps.local', 'LLM Evaluation', 'Advanced'),
      ('mali.ai.demo@uaps.local', 'Prompt Engineering', 'Advanced'),
      ('mali.ai.demo@uaps.local', 'Docker', 'Intermediate'),
      ('mali.ai.demo@uaps.local', 'Kubernetes', 'Intermediate'),
      ('mali.ai.demo@uaps.local', 'AWS', 'Intermediate')
  ) AS t(email, skill_name, proficiency_level)
)
INSERT INTO user_skills (user_id, skill_id, proficiency_level)
SELECT du.user_id, s.skill_id, usl.proficiency_level
FROM demo_users du
JOIN user_skill_levels usl ON usl.email = du.email
JOIN skills s ON s.name = usl.skill_name
ON CONFLICT (user_id, skill_id)
DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level;

-- 4) Insert demo projects.
WITH demo_users AS (
  SELECT user_id, email
  FROM users
  WHERE email IN ('napat.backend.demo@uaps.local', 'mali.ai.demo@uaps.local')
),
project_values AS (
  SELECT *
  FROM (
    VALUES
      (
        'napat.backend.demo@uaps.local',
        'Realtime Order Matching API',
        'Designed a low-latency matching service with Kafka events, Redis caching, and transactional PostgreSQL writes.',
        'https://github.com/napat-backend/realtime-order-matching',
        true,
        'Completed'
      ),
      (
        'napat.backend.demo@uaps.local',
        'Platform Reliability Dashboard',
        'Implemented SLO monitoring and incident timeline tooling for backend squads across microservices.',
        'https://github.com/napat-backend/reliability-dashboard',
        true,
        'Completed'
      ),
      (
        'mali.ai.demo@uaps.local',
        'Recruiter AI Ranking Service',
        'Built feature store + reranking model to prioritize top candidates and reduce recruiter screening time.',
        'https://github.com/mali-ai/recruiter-ai-ranking',
        true,
        'Completed'
      ),
      (
        'mali.ai.demo@uaps.local',
        'LLM Resume Quality Evaluator',
        'Created LLM-based scoring pipelines with rubric checks, hallucination guardrails, and experiment tracking.',
        'https://github.com/mali-ai/llm-resume-eval',
        true,
        'Completed'
      )
  ) AS t(email, title, description, repo_url, is_active, status)
)
INSERT INTO projects (user_id, title, description, repo_url, is_active, status, created_at, updated_at)
SELECT du.user_id, pv.title, pv.description, pv.repo_url, pv.is_active, pv.status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM demo_users du
JOIN project_values pv ON pv.email = du.email
WHERE NOT EXISTS (
  SELECT 1
  FROM projects p
  WHERE p.user_id = du.user_id
    AND p.title = pv.title
);

-- 5) Insert demo experiences.
WITH demo_users AS (
  SELECT user_id, email
  FROM users
  WHERE email IN ('napat.backend.demo@uaps.local', 'mali.ai.demo@uaps.local')
),
experience_values AS (
  SELECT *
  FROM (
    VALUES
      (
        'napat.backend.demo@uaps.local',
        'Siam Payments Platform',
        'Senior Backend Engineer',
        'Owned backend architecture for payment orchestration and reliability engineering.',
        'Reduced p99 latency by 42% after stream partition redesign and read model optimization.',
        DATE '2022-02-01',
        NULL
      ),
      (
        'napat.backend.demo@uaps.local',
        'Cloud Native Guild',
        'Backend Engineer',
        'Implemented service migration to containerized workloads with deployment automation.',
        'Migrated 18 services to Kubernetes with zero downtime rollout strategy.',
        DATE '2020-01-01',
        DATE '2022-01-31'
      ),
      (
        'mali.ai.demo@uaps.local',
        'Talent Graph AI',
        'Applied AI Engineer',
        'Built candidate-job matching models and online evaluation framework.',
        'Increased recruiter shortlisting precision by 31% with feature redesign and model calibration.',
        DATE '2021-06-01',
        NULL
      ),
      (
        'mali.ai.demo@uaps.local',
        'Data Platform Lab',
        'Machine Learning Engineer',
        'Developed model lifecycle workflows and inference observability tooling.',
        'Cut failed model deployments by 55% via staged rollout and drift detection alerts.',
        DATE '2019-08-01',
        DATE '2021-05-31'
      )
  ) AS t(email, organization, role, description, achievement, start_date, end_date)
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
  du.user_id,
  ev.organization,
  ev.role,
  ev.description,
  ev.achievement,
  ev.start_date,
  ev.end_date,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM demo_users du
JOIN experience_values ev ON ev.email = du.email
WHERE NOT EXISTS (
  SELECT 1
  FROM experiences e
  WHERE e.user_id = du.user_id
    AND e.organization = ev.organization
    AND e.role = ev.role
);

-- 6) Insert recruiter-facing resumes with public/company-only visibility.
WITH demo_users AS (
  SELECT user_id, email
  FROM users
  WHERE email IN ('napat.backend.demo@uaps.local', 'mali.ai.demo@uaps.local')
),
resume_values AS (
  SELECT *
  FROM (
    VALUES
      (
        'napat.backend.demo@uaps.local',
        'Backend Platform Engineer - Public',
        'Backend Platform Engineer',
        'ScalePay',
        'public',
        true,
        'Published'
      ),
      (
        'napat.backend.demo@uaps.local',
        'Cloud Reliability Engineer - Company Only',
        'Site Reliability Engineer',
        'CloudOps Asia',
        'company-only',
        false,
        'Published'
      ),
      (
        'mali.ai.demo@uaps.local',
        'Applied AI Engineer - Public',
        'Applied AI Engineer',
        'TalentAI Labs',
        'public',
        true,
        'Published'
      )
  ) AS t(email, version_name, target_job_title, target_company, visibility, is_active, status)
)
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
SELECT
  du.user_id,
  rv.version_name,
  rv.target_job_title,
  rv.target_company,
  rv.visibility::varchar,
  rv.is_active,
  rv.status,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM demo_users du
JOIN resume_values rv ON rv.email = du.email
WHERE NOT EXISTS (
  SELECT 1
  FROM resumes r
  WHERE r.user_id = du.user_id
    AND r.version_name = rv.version_name
);

-- 7) Ensure baseline info exists for marketplace cards.
WITH resume_targets AS (
  SELECT r.resume_id, r.version_name, u.email
  FROM resumes r
  JOIN users u ON u.user_id = r.user_id
  WHERE (u.email, r.version_name) IN (
    ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public'),
    ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only'),
    ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public')
  )
),
baseline_values AS (
  SELECT *
  FROM (
    VALUES
      (
        'napat.backend.demo@uaps.local',
        'Backend Platform Engineer - Public',
        'Napat Srisuk',
        'Backend Platform Engineer',
        'napat.backend.demo@uaps.local',
        '+66-80-111-2233',
        'Bangkok, Thailand',
        'https://www.linkedin.com/in/napat-backend',
        'https://napat.dev',
        'https://github.com/napat-backend',
        'Backend engineer focused on distributed systems, reliability, and high-volume API performance.'
      ),
      (
        'napat.backend.demo@uaps.local',
        'Cloud Reliability Engineer - Company Only',
        'Napat Srisuk',
        'Site Reliability Engineer',
        NULL,
        '+66-80-111-2233',
        'Bangkok, Thailand',
        'https://www.linkedin.com/in/napat-backend',
        NULL,
        'https://github.com/napat-backend',
        'SRE profile tailored for internal production reliability and incident response ownership.'
      ),
      (
        'mali.ai.demo@uaps.local',
        'Applied AI Engineer - Public',
        'Mali Chantarang',
        'Applied AI Engineer',
        'mali.ai.demo@uaps.local',
        '+66-81-444-8899',
        'Chiang Mai, Thailand',
        'https://www.linkedin.com/in/mali-ai',
        'https://mali.ai',
        'https://github.com/mali-ai',
        'Applied AI engineer delivering ranking, recommendation, and LLM evaluation systems for recruiting products.'
      )
  ) AS t(email, version_name, full_name, headline, email_contact, phone, location, linkedin_url, portfolio_url, github_url, summary)
)
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
SELECT
  rt.resume_id,
  bv.full_name,
  bv.headline,
  bv.email_contact,
  bv.phone,
  bv.location,
  bv.linkedin_url,
  bv.portfolio_url,
  bv.github_url,
  bv.summary,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM resume_targets rt
JOIN baseline_values bv ON bv.email = rt.email AND bv.version_name = rt.version_name
ON CONFLICT (resume_id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  headline = EXCLUDED.headline,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  linkedin_url = EXCLUDED.linkedin_url,
  portfolio_url = EXCLUDED.portfolio_url,
  github_url = EXCLUDED.github_url,
  summary = EXCLUDED.summary,
  updated_at = CURRENT_TIMESTAMP;

-- 8) Link project and skill composition for resumes.
WITH resume_ref AS (
  SELECT r.resume_id, r.version_name, u.email
  FROM resumes r
  JOIN users u ON u.user_id = r.user_id
  WHERE (u.email, r.version_name) IN (
    ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public'),
    ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only'),
    ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public')
  )
),
project_map AS (
  SELECT *
  FROM (
    VALUES
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Realtime Order Matching API'),
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Platform Reliability Dashboard'),
      ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only', 'Platform Reliability Dashboard'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'Recruiter AI Ranking Service'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'LLM Resume Quality Evaluator')
  ) AS t(email, resume_name, project_title)
)
INSERT INTO resume_projects (resume_id, project_id)
SELECT rr.resume_id, p.project_id
FROM resume_ref rr
JOIN project_map pm ON pm.email = rr.email AND pm.resume_name = rr.version_name
JOIN users u ON u.email = rr.email
JOIN projects p ON p.user_id = u.user_id AND p.title = pm.project_title
ON CONFLICT (resume_id, project_id) DO NOTHING;

WITH resume_ref AS (
  SELECT r.resume_id, r.version_name, u.email
  FROM resumes r
  JOIN users u ON u.user_id = r.user_id
  WHERE (u.email, r.version_name) IN (
    ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public'),
    ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only'),
    ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public')
  )
),
skill_map AS (
  SELECT *
  FROM (
    VALUES
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Node.js'),
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'PostgreSQL'),
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Docker'),
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'AWS'),
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Kubernetes'),
      ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only', 'Docker'),
      ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only', 'Kubernetes'),
      ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only', 'Terraform'),
      ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only', 'AWS'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'Python'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'PyTorch'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'MLOps'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'LLM Evaluation'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'Prompt Engineering'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'Docker')
  ) AS t(email, resume_name, skill_name)
)
INSERT INTO resume_skills (resume_id, skill_id)
SELECT rr.resume_id, s.skill_id
FROM resume_ref rr
JOIN skill_map sm ON sm.email = rr.email AND sm.resume_name = rr.version_name
JOIN skills s ON s.name = sm.skill_name
ON CONFLICT (resume_id, skill_id) DO NOTHING;

WITH resume_ref AS (
  SELECT r.resume_id, r.version_name, u.email
  FROM resumes r
  JOIN users u ON u.user_id = r.user_id
  WHERE (u.email, r.version_name) IN (
    ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public'),
    ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only'),
    ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public')
  )
),
experience_map AS (
  SELECT *
  FROM (
    VALUES
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Siam Payments Platform', 'Senior Backend Engineer'),
      ('napat.backend.demo@uaps.local', 'Backend Platform Engineer - Public', 'Cloud Native Guild', 'Backend Engineer'),
      ('napat.backend.demo@uaps.local', 'Cloud Reliability Engineer - Company Only', 'Siam Payments Platform', 'Senior Backend Engineer'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'Talent Graph AI', 'Applied AI Engineer'),
      ('mali.ai.demo@uaps.local', 'Applied AI Engineer - Public', 'Data Platform Lab', 'Machine Learning Engineer')
  ) AS t(email, resume_name, organization, role)
)
INSERT INTO resume_experiences (resume_id, experience_id)
SELECT rr.resume_id, e.experience_id
FROM resume_ref rr
JOIN experience_map em ON em.email = rr.email AND em.resume_name = rr.version_name
JOIN users u ON u.email = rr.email
JOIN experiences e ON e.user_id = u.user_id AND e.organization = em.organization AND e.role = em.role
ON CONFLICT (resume_id, experience_id) DO NOTHING;

-- 9) Ensure only one active resume per demo user.
UPDATE resumes r
SET is_active = CASE
  WHEN u.email = 'napat.backend.demo@uaps.local' AND r.version_name = 'Backend Platform Engineer - Public' THEN true
  WHEN u.email = 'mali.ai.demo@uaps.local' AND r.version_name = 'Applied AI Engineer - Public' THEN true
  ELSE false
END,
updated_at = CURRENT_TIMESTAMP
FROM users u
WHERE r.user_id = u.user_id
  AND u.email IN ('napat.backend.demo@uaps.local', 'mali.ai.demo@uaps.local')
  AND r.version_name IN (
    'Backend Platform Engineer - Public',
    'Cloud Reliability Engineer - Company Only',
    'Applied AI Engineer - Public'
  );