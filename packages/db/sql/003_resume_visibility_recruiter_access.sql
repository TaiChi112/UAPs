-- Foundation schema for resume visibility, recruiter access control, and anti-scam governance.
-- Run after 001_init_uaps.sql.

ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS profile_summary TEXT,
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'resume_visibility_check'
  ) THEN
    ALTER TABLE resumes
      ADD CONSTRAINT resume_visibility_check CHECK (visibility IN ('private', 'public', 'company-only'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_resumes_visibility ON resumes(visibility);
CREATE INDEX IF NOT EXISTS idx_resumes_target_job_status ON resumes(target_job_title, status);

-- Store common profile fields for each resume as a structured base section.
CREATE TABLE IF NOT EXISTS resume_basics (
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

-- Company registry for verified recruiters.
CREATE TABLE IF NOT EXISTS companies (
  company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  website VARCHAR(255),
  country VARCHAR(100),
  verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT company_verification_status_check CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

CREATE TABLE IF NOT EXISTS recruiter_accounts (
  recruiter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role_title VARCHAR(255),
  work_phone VARCHAR(50),
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
  account_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recruiter_account_status_check CHECK (account_status IN ('pending', 'active', 'suspended', 'rejected')),
  CONSTRAINT recruiter_risk_level_check CHECK (risk_level IN ('low', 'medium', 'high', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_recruiter_company ON recruiter_accounts(company_id);

CREATE TABLE IF NOT EXISTS recruiter_verifications (
  verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiter_accounts(recruiter_id) ON DELETE CASCADE,
  verifier_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  verification_type VARCHAR(50) NOT NULL,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  evidence_uri TEXT,
  notes TEXT,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP,
  CONSTRAINT recruiter_verification_status_check CHECK (verification_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS resume_access_requests (
  access_request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES recruiter_accounts(recruiter_id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  job_requisition_id VARCHAR(120),
  position_title VARCHAR(255),
  requested_visibility VARCHAR(20) NOT NULL DEFAULT 'read-only',
  request_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  reviewed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT access_request_status_check CHECK (request_status IN ('pending', 'approved', 'rejected', 'expired', 'revoked')),
  CONSTRAINT requested_visibility_check CHECK (requested_visibility IN ('read-only', 'export'))
);

CREATE INDEX IF NOT EXISTS idx_access_requests_resume_status ON resume_access_requests(resume_id, request_status);
CREATE INDEX IF NOT EXISTS idx_access_requests_recruiter ON resume_access_requests(recruiter_id, request_status);

CREATE TABLE IF NOT EXISTS resume_access_audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES recruiter_accounts(recruiter_id) ON DELETE SET NULL,
  access_request_id UUID REFERENCES resume_access_requests(access_request_id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  CONSTRAINT access_audit_action_check CHECK (action IN ('view', 'export', 'request', 'approve', 'reject', 'revoke', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_audit_resume_time ON resume_access_audit_logs(resume_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_recruiter_time ON resume_access_audit_logs(recruiter_id, event_time DESC);

CREATE TABLE IF NOT EXISTS fraud_signals (
  fraud_signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES recruiter_accounts(recruiter_id) ON DELETE CASCADE,
  signal_type VARCHAR(80) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  description TEXT,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fraud_signal_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_recruiter ON fraud_signals(recruiter_id, detected_at DESC);
