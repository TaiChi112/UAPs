-- Active Resume Builder bootstrap schema
-- Note: The Prisma schema (apps/api/prisma/schema.prisma) is the primary application source of truth.
-- Legacy recruiter marketplace, access verifications, and fraud signal DDL have been removed.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. users
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    github_url VARCHAR(255),
    github_id VARCHAR(255) UNIQUE,
    github_login VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. skills
CREATE TABLE skills (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL
);

-- 3. projects
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    repo_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_status_check CHECK (status IN ('In Progress', 'Completed', 'On Hold'))
);

-- 4. experiences
CREATE TABLE experiences (
    experience_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    organization VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT,
    achievement TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT experience_date_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- 5. certificates
CREATE TABLE certificates (
    certificate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. awards
CREATE TABLE awards (
    award_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. resumes
CREATE TABLE resumes (
    resume_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    version_name VARCHAR(255) NOT NULL,
    target_job_title VARCHAR(255),
    target_company VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    profile_summary TEXT,
    location VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resume_status_check CHECK (status IN ('Draft', 'Published', 'Archived')),
    CONSTRAINT resume_visibility_check CHECK (visibility IN ('private', 'public', 'company-only'))
);

-- 8. resume_basics
CREATE TABLE resume_basics (
    resume_id UUID PRIMARY KEY REFERENCES resumes(resume_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    github_url VARCHAR(255),
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. user_skills
CREATE TABLE user_skills (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) NOT NULL DEFAULT 'Intermediate',
    PRIMARY KEY (user_id, skill_id),
    CONSTRAINT proficiency_level_check CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'))
);

-- 10. project_skills
CREATE TABLE project_skills (
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

-- 11. experience_skills
CREATE TABLE experience_skills (
    experience_id UUID NOT NULL REFERENCES experiences(experience_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (experience_id, skill_id)
);

-- 12. resume_projects
CREATE TABLE resume_projects (
    resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    PRIMARY KEY (resume_id, project_id)
);

-- 13. resume_skills
CREATE TABLE resume_skills (
    resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (resume_id, skill_id)
);

-- 14. resume_experiences
CREATE TABLE resume_experiences (
    resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES experiences(experience_id) ON DELETE CASCADE,
    PRIMARY KEY (resume_id, experience_id)
);

-- 15. resume_certificates
CREATE TABLE resume_certificates (
    resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    certificate_id UUID NOT NULL REFERENCES certificates(certificate_id) ON DELETE CASCADE,
    PRIMARY KEY (resume_id, certificate_id)
);

-- 16. resume_awards
CREATE TABLE resume_awards (
    resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    award_id UUID NOT NULL REFERENCES awards(award_id) ON DELETE CASCADE,
    PRIMARY KEY (resume_id, award_id)
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_experiences_user_id ON experiences(user_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_awards_user_id ON awards(user_id);
CREATE INDEX idx_resumes_visibility ON resumes(visibility);
CREATE INDEX idx_resumes_target_job_status ON resumes(target_job_title, status);
