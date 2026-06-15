import "dotenv/config";

import type { Prisma } from "../src/generated/prisma/client";

import { prisma } from "../src/db/prisma";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

type SeedSkill = {
  key: string;
  name: string;
  category: string;
  proficiencyLevel: SkillLevel;
};

type SeedProject = {
  key: string;
  title: string;
  description: string;
  repoUrl?: string;
  status: "Completed" | "In Progress";
  isActive: boolean;
  skillKeys: string[];
};

type SeedExperience = {
  key: string;
  organization: string;
  role: string;
  description: string;
  achievement: string;
  startDate: string;
  endDate?: string;
  skillKeys: string[];
};

type SeedCertificate = {
  key: string;
  name: string;
  year: string;
};

type SeedAward = {
  key: string;
  name: string;
  desc: string;
};

type SeedResume = {
  versionName: string;
  targetJobTitle: string;
  targetCompany: string;
  visibility: "private" | "public" | "company-only";
  status: "Draft" | "Published" | "Archived";
  isActive: boolean;
  profileSummary: string;
  headline: string;
  summary: string;
  skillKeys: string[];
  projectKeys: string[];
  experienceKeys: string[];
  certificateKeys: string[];
  awardKeys: string[];
};

type SeedProfile = {
  email: string;
  name: string;
  githubLogin: string;
  githubId: string;
  githubUrl: string;
  avatarUrl: string;
  location: string;
  phone: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: SeedSkill[];
  projects: SeedProject[];
  experiences: SeedExperience[];
  certificates: SeedCertificate[];
  awards: SeedAward[];
  resumes: SeedResume[];
};

const paragraph = (...sentences: string[]) => sentences.join(" ");

const isoDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

const profiles: SeedProfile[] = [
  {
    email: "maya.chen.demo@uaps.local",
    name: "Maya Chen",
    githubLogin: "maya-chen-demo",
    githubId: "demo-maya-chen-001",
    githubUrl: "https://github.com/maya-chen-demo",
    avatarUrl: "https://avatars.githubusercontent.com/u/1001001?v=4",
    location: "Singapore",
    phone: "+65 9123 4567",
    linkedinUrl: "https://www.linkedin.com/in/maya-chen-demo",
    portfolioUrl: "https://maya-chen-demo.dev",
    skills: [
      {
        key: "typescript",
        name: "TypeScript",
        category: "programming",
        proficiencyLevel: "Expert",
      },
      {
        key: "react",
        name: "React",
        category: "frameworks",
        proficiencyLevel: "Expert",
      },
      {
        key: "nextjs",
        name: "Next.js",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "nodejs",
        name: "Node.js",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "postgresql",
        name: "PostgreSQL",
        category: "data",
        proficiencyLevel: "Advanced",
      },
      {
        key: "graphql",
        name: "GraphQL",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "redis",
        name: "Redis",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      {
        key: "tailwindcss",
        name: "Tailwind CSS",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "playwright",
        name: "Playwright",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      {
        key: "docker",
        name: "Docker",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      {
        key: "aws",
        name: "AWS",
        category: "cloud",
        proficiencyLevel: "Advanced",
      },
      {
        key: "stripe",
        name: "Stripe",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
    ],
    projects: [
      {
        key: "control-plane",
        title: "B2B Commerce Control Plane",
        description: paragraph(
          "Built a multi-tenant operations console for regional merchants using Next.js, GraphQL, and PostgreSQL.",
          "Designed optimistic inventory workflows, order exceptions dashboards, and audit-friendly activity trails for finance and support teams.",
          "Reduced reconciliation turnaround from two days to under two hours by replacing spreadsheet-driven handoffs with event-backed automation."
        ),
        repoUrl: "https://github.com/maya-chen-demo/b2b-commerce-control-plane",
        status: "Completed",
        isActive: true,
        skillKeys: [
          "typescript",
          "react",
          "nextjs",
          "graphql",
          "postgresql",
          "redis",
        ],
      },
      {
        key: "creator-analytics",
        title: "Creator Revenue Analytics Suite",
        description: paragraph(
          "Implemented a subscription analytics product that combined cohort retention charts, Stripe payout reconciliation, and churn diagnostics.",
          "Shipped reusable charting primitives, CSV import pipelines, and role-based access controls for agency operators managing dozens of creator accounts.",
          "Instrumented end-to-end tests with Playwright to protect billing flows, shared exports, and timezone-sensitive revenue rollups."
        ),
        repoUrl: "https://github.com/maya-chen-demo/creator-analytics-suite",
        status: "Completed",
        isActive: true,
        skillKeys: [
          "typescript",
          "react",
          "nodejs",
          "stripe",
          "playwright",
          "postgresql",
        ],
      },
      {
        key: "patient-portal",
        title: "Patient Portal Modernization",
        description: paragraph(
          "Led the frontend platform migration of a legacy healthcare portal to a composable Next.js architecture with strict design-token governance.",
          "Introduced typed BFF endpoints, server-driven feature flags, and resilient document upload flows for medical records and care plans.",
          "Partnered with security and compliance stakeholders to harden session handling, audit logging, and incident triage visibility."
        ),
        repoUrl: "https://github.com/maya-chen-demo/patient-portal-modernization",
        status: "In Progress",
        isActive: true,
        skillKeys: [
          "typescript",
          "nextjs",
          "tailwindcss",
          "aws",
          "docker",
        ],
      },
    ],
    experiences: [
      {
        key: "northstar",
        organization: "Northstar Commerce",
        role: "Senior Full-Stack Engineer",
        description: paragraph(
          "Owned merchant-facing product surfaces across catalog operations, billing, and regional order orchestration."
        ),
        achievement: paragraph(
          "Architected a typed monorepo delivery model spanning Next.js apps, Node services, and shared UI packages.",
          "Mentored three engineers through production incident reviews, test strategy improvements, and incremental service decomposition."
        ),
        startDate: "2023-02-01",
        skillKeys: [
          "typescript",
          "react",
          "nextjs",
          "nodejs",
          "postgresql",
          "redis",
        ],
      },
      {
        key: "helio",
        organization: "Helio Health Systems",
        role: "Software Engineer",
        description: paragraph(
          "Delivered patient-facing scheduling and care-plan workflows in a regulated product environment."
        ),
        achievement: paragraph(
          "Improved Lighthouse performance by 38 percent while reducing accessibility regressions through automated E2E coverage and shared component contracts.",
          "Introduced observability for form drop-off and upload failures that directly informed product roadmap prioritization."
        ),
        startDate: "2020-05-01",
        endDate: "2023-01-01",
        skillKeys: ["react", "nodejs", "postgresql", "playwright", "tailwindcss"],
      },
      {
        key: "independent-studio",
        organization: "Independent Product Studio",
        role: "Freelance Product Engineer",
        description: paragraph(
          "Partnered with seed-stage founders to scope MVPs, unblock launch plans, and establish modern CI/CD and analytics foundations."
        ),
        achievement: paragraph(
          "Delivered investor-demo quality interfaces in two- to four-week increments, balancing product speed with maintainable architecture and deployment hygiene."
        ),
        startDate: "2018-06-01",
        endDate: "2020-04-01",
        skillKeys: ["typescript", "react", "graphql", "stripe", "aws"],
      },
    ],
    certificates: [
      {
        key: "aws-developer",
        name: "AWS Certified Developer - Associate",
        year: "2025",
      },
      {
        key: "graphql-apollo",
        name: "Apollo Graph Developer Certification",
        year: "2024",
      },
    ],
    awards: [
      {
        key: "dx-innovation",
        name: "DX Innovation Award",
        desc: "Recognized for modernizing the internal frontend platform and shared component delivery workflow.",
      },
    ],
    resumes: [
      {
        versionName: "Senior Full-Stack Engineer @ FinGrid",
        targetJobTitle: "Senior Full-Stack Engineer",
        targetCompany: "FinGrid",
        visibility: "public",
        status: "Published",
        isActive: true,
        profileSummary: paragraph(
          "Product-minded engineer with a strong record of shipping revenue-critical web platforms, typed APIs, and resilient frontend systems for multi-tenant products."
        ),
        headline: "Senior Full-Stack Engineer building reliable product systems",
        summary: paragraph(
          "Senior Full-Stack Engineer with deep experience across React, Next.js, Node.js, and PostgreSQL.",
          "Known for translating messy operational workflows into fast, polished product experiences with dependable billing, analytics, and release practices."
        ),
        skillKeys: [
          "typescript",
          "react",
          "nextjs",
          "nodejs",
          "postgresql",
          "graphql",
          "redis",
          "playwright",
        ],
        projectKeys: ["control-plane", "creator-analytics"],
        experienceKeys: ["northstar", "helio"],
        certificateKeys: ["aws-developer", "graphql-apollo"],
        awardKeys: ["dx-innovation"],
      },
      {
        versionName: "Product Engineer @ CareStack",
        targetJobTitle: "Product Engineer",
        targetCompany: "CareStack",
        visibility: "public",
        status: "Archived",
        isActive: false,
        profileSummary: paragraph(
          "Versatile product engineer with experience modernizing customer-facing healthcare and SaaS workflows under strict reliability requirements."
        ),
        headline: "Product Engineer for regulated, customer-facing software",
        summary: paragraph(
          "Engineer focused on frontend architecture, developer experience, and measurable product quality.",
          "Comfortable leading migrations, collaborating with design, and delivering maintainable systems in regulated environments."
        ),
        skillKeys: [
          "typescript",
          "react",
          "nextjs",
          "tailwindcss",
          "playwright",
          "aws",
        ],
        projectKeys: ["patient-portal", "creator-analytics"],
        experienceKeys: ["helio", "northstar"],
        certificateKeys: ["aws-developer"],
        awardKeys: ["dx-innovation"],
      },
    ],
  },
  {
    email: "rafael.ortiz.demo@uaps.local",
    name: "Rafael Ortiz",
    githubLogin: "rafael-ortiz-demo",
    githubId: "demo-rafael-ortiz-002",
    githubUrl: "https://github.com/rafael-ortiz-demo",
    avatarUrl: "https://avatars.githubusercontent.com/u/1001002?v=4",
    location: "Mexico City, Mexico",
    phone: "+52 55 1234 5678",
    linkedinUrl: "https://www.linkedin.com/in/rafael-ortiz-demo",
    portfolioUrl: "https://rafael-ortiz-demo.dev",
    skills: [
      { key: "go", name: "Go", category: "programming", proficiencyLevel: "Expert" },
      {
        key: "python",
        name: "Python",
        category: "programming",
        proficiencyLevel: "Advanced",
      },
      {
        key: "kubernetes",
        name: "Kubernetes",
        category: "devops",
        proficiencyLevel: "Expert",
      },
      {
        key: "terraform",
        name: "Terraform",
        category: "devops",
        proficiencyLevel: "Expert",
      },
      { key: "aws", name: "AWS", category: "cloud", proficiencyLevel: "Expert" },
      { key: "gcp", name: "GCP", category: "cloud", proficiencyLevel: "Advanced" },
      {
        key: "argocd",
        name: "Argo CD",
        category: "devops",
        proficiencyLevel: "Advanced",
      },
      {
        key: "github-actions",
        name: "GitHub Actions",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      {
        key: "prometheus",
        name: "Prometheus",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      {
        key: "grafana",
        name: "Grafana",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      { key: "linux", name: "Linux", category: "tools", proficiencyLevel: "Expert" },
      {
        key: "postgresql",
        name: "PostgreSQL",
        category: "data",
        proficiencyLevel: "Advanced",
      },
    ],
    projects: [
      {
        key: "multi-region-platform",
        title: "Multi-Region Platform Bootstrap",
        description: paragraph(
          "Designed a repeatable Kubernetes and Terraform blueprint for launching customer environments across AWS regions with consistent policy, secrets, and networking defaults.",
          "Packaged cluster add-ons, ingress standards, and operational playbooks into a reusable platform starter kit consumed by four internal product teams.",
          "Cut environment provisioning lead time from three weeks to under forty-five minutes."
        ),
        repoUrl: "https://github.com/rafael-ortiz-demo/multi-region-platform-bootstrap",
        status: "Completed",
        isActive: true,
        skillKeys: ["go", "kubernetes", "terraform", "aws", "argocd"],
      },
      {
        key: "preview-environments",
        title: "Ephemeral Preview Environments",
        description: paragraph(
          "Built GitHub Actions and Argo CD automation that created per-branch preview stacks with seeded databases, smoke tests, and automatic cleanup.",
          "Added policy-aware namespace quotas and cost telemetry so product teams could ship faster without losing control of shared cluster resources.",
          "Drove a 60 percent reduction in release coordination overhead for QA and product owners."
        ),
        repoUrl: "https://github.com/rafael-ortiz-demo/preview-environments",
        status: "Completed",
        isActive: true,
        skillKeys: [
          "github-actions",
          "argocd",
          "kubernetes",
          "prometheus",
          "grafana",
        ],
      },
      {
        key: "observability-lakehouse",
        title: "Observability Lakehouse Pipeline",
        description: paragraph(
          "Created a log and metrics processing pipeline that consolidated service events, SLO burn alerts, and queryable audit trails into a central operations dataset.",
          "Used Go workers and Python data quality checks to normalize telemetry from heterogeneous services with minimal agent customization.",
          "Enabled faster incident reconstruction and postmortem analysis across dozens of platform services."
        ),
        repoUrl: "https://github.com/rafael-ortiz-demo/observability-lakehouse",
        status: "In Progress",
        isActive: true,
        skillKeys: ["go", "python", "postgresql", "prometheus", "grafana", "gcp"],
      },
    ],
    experiences: [
      {
        key: "quanta-cloud",
        organization: "Quanta Cloud",
        role: "Staff Platform Engineer",
        description: paragraph(
          "Led platform engineering initiatives spanning cluster lifecycle, release automation, and production operability for a fast-growing SaaS portfolio."
        ),
        achievement: paragraph(
          "Standardized GitOps delivery, disaster recovery drills, and cost guardrails across twelve Kubernetes clusters.",
          "Created internal platform APIs and golden paths that let application teams self-serve infrastructure safely."
        ),
        startDate: "2022-04-01",
        skillKeys: [
          "go",
          "kubernetes",
          "terraform",
          "aws",
          "argocd",
          "prometheus",
        ],
      },
      {
        key: "meridian",
        organization: "Meridian Payments",
        role: "Site Reliability Engineer",
        description: paragraph(
          "Owned on-call reliability, release hardening, and incident response for card processing and settlement systems."
        ),
        achievement: paragraph(
          "Reduced noisy alerts by 45 percent, automated runbook steps for top recurring incidents, and introduced service-level objectives that improved escalation clarity."
        ),
        startDate: "2019-07-01",
        endDate: "2022-03-01",
        skillKeys: ["linux", "postgresql", "aws", "prometheus", "grafana", "python"],
      },
      {
        key: "infra-consulting",
        organization: "Independent Infrastructure Consulting",
        role: "Cloud Infrastructure Consultant",
        description: paragraph(
          "Helped startups adopt CI/CD, infrastructure-as-code, and cost-conscious cloud foundations before their first scale-up milestone."
        ),
        achievement: paragraph(
          "Delivered battle-tested deployment templates, IAM baselines, and environment standards that raised the operational maturity of early engineering teams."
        ),
        startDate: "2017-01-01",
        endDate: "2019-06-01",
        skillKeys: ["terraform", "aws", "gcp", "github-actions", "linux"],
      },
    ],
    certificates: [
      {
        key: "cka",
        name: "Certified Kubernetes Administrator",
        year: "2024",
      },
      {
        key: "aws-sa",
        name: "AWS Certified Solutions Architect - Professional",
        year: "2025",
      },
    ],
    awards: [
      {
        key: "incident-excellence",
        name: "Operational Excellence Award",
        desc: "Awarded for building incident response workflows that reduced mean time to recovery across critical services.",
      },
    ],
    resumes: [
      {
        versionName: "Platform Engineer @ CloudArc",
        targetJobTitle: "Platform Engineer",
        targetCompany: "CloudArc",
        visibility: "public",
        status: "Published",
        isActive: true,
        profileSummary: paragraph(
          "Platform engineer specializing in Kubernetes, Terraform, and reliability systems that help product teams ship quickly without losing operational control."
        ),
        headline: "Platform engineer building safe and scalable delivery systems",
        summary: paragraph(
          "Engineer with a strong bias toward repeatable infrastructure, pragmatic observability, and low-friction developer platforms.",
          "Experienced in scaling GitOps, incident response, and multi-region platform patterns."
        ),
        skillKeys: [
          "go",
          "kubernetes",
          "terraform",
          "aws",
          "argocd",
          "github-actions",
          "prometheus",
          "grafana",
        ],
        projectKeys: ["multi-region-platform", "preview-environments"],
        experienceKeys: ["quanta-cloud", "meridian"],
        certificateKeys: ["cka", "aws-sa"],
        awardKeys: ["incident-excellence"],
      },
      {
        versionName: "SRE Lead @ LedgerOps",
        targetJobTitle: "Site Reliability Engineering Lead",
        targetCompany: "LedgerOps",
        visibility: "public",
        status: "Archived",
        isActive: false,
        profileSummary: paragraph(
          "SRE and platform leader focused on reliability engineering, incident response systems, and cloud governance that scales with engineering growth."
        ),
        headline: "SRE leader for resilient distributed systems",
        summary: paragraph(
          "Hands-on SRE with experience reducing alert fatigue, shaping on-call culture, and building observability pipelines that accelerate incident analysis."
        ),
        skillKeys: [
          "python",
          "linux",
          "aws",
          "prometheus",
          "grafana",
          "postgresql",
        ],
        projectKeys: ["observability-lakehouse", "preview-environments"],
        experienceKeys: ["meridian", "quanta-cloud"],
        certificateKeys: ["cka"],
        awardKeys: ["incident-excellence"],
      },
    ],
  },
  {
    email: "priya.natarajan.demo@uaps.local",
    name: "Priya Natarajan",
    githubLogin: "priya-natarajan-demo",
    githubId: "demo-priya-natarajan-003",
    githubUrl: "https://github.com/priya-natarajan-demo",
    avatarUrl: "https://avatars.githubusercontent.com/u/1001003?v=4",
    location: "Bengaluru, India",
    phone: "+91 98765 43210",
    linkedinUrl: "https://www.linkedin.com/in/priya-natarajan-demo",
    portfolioUrl: "https://priya-natarajan-demo.ai",
    skills: [
      { key: "python", name: "Python", category: "programming", proficiencyLevel: "Expert" },
      { key: "sql", name: "SQL", category: "data", proficiencyLevel: "Expert" },
      {
        key: "pytorch",
        name: "PyTorch",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "tensorflow",
        name: "TensorFlow",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "airflow",
        name: "Airflow",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      { key: "dbt", name: "dbt", category: "tools", proficiencyLevel: "Advanced" },
      {
        key: "pandas",
        name: "Pandas",
        category: "data",
        proficiencyLevel: "Expert",
      },
      {
        key: "bigquery",
        name: "BigQuery",
        category: "data",
        proficiencyLevel: "Advanced",
      },
      {
        key: "vertexai",
        name: "Vertex AI",
        category: "cloud",
        proficiencyLevel: "Advanced",
      },
      {
        key: "mlflow",
        name: "MLflow",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      {
        key: "fastapi",
        name: "FastAPI",
        category: "frameworks",
        proficiencyLevel: "Advanced",
      },
      {
        key: "docker",
        name: "Docker",
        category: "tools",
        proficiencyLevel: "Advanced",
      },
      { key: "kafka", name: "Kafka", category: "tools", proficiencyLevel: "Advanced" },
    ],
    projects: [
      {
        key: "demand-forecasting",
        title: "Retail Demand Forecasting Workbench",
        description: paragraph(
          "Built a hierarchical demand forecasting platform that combined feature engineering, experiment tracking, and scenario analysis for category planners.",
          "Shipped model diagnostics, drift monitoring, and explainability views that helped commercial teams trust forecast adjustments during promotions and supply shocks.",
          "Improved weekly forecast accuracy by 11 percent in high-variance product lines."
        ),
        repoUrl: "https://github.com/priya-natarajan-demo/demand-forecasting-workbench",
        status: "Completed",
        isActive: true,
        skillKeys: ["python", "sql", "pytorch", "airflow", "mlflow", "bigquery"],
      },
      {
        key: "credit-risk",
        title: "Credit Risk Explainability Pipeline",
        description: paragraph(
          "Created a credit risk modeling workflow with transparent feature lineage, challenger model evaluation, and regulator-friendly narrative exports.",
          "Integrated dbt transformations, MLflow lineage, and FastAPI inference endpoints into a single release process with reproducible artifacts.",
          "Enabled risk analysts to compare model behavior across customer segments without relying on ad hoc notebooks."
        ),
        repoUrl: "https://github.com/priya-natarajan-demo/credit-risk-explainability",
        status: "Completed",
        isActive: true,
        skillKeys: ["python", "sql", "dbt", "mlflow", "fastapi", "docker"],
      },
      {
        key: "support-copilot",
        title: "Customer Support Copilot Evaluation Stack",
        description: paragraph(
          "Developed an internal evaluation harness for retrieval-augmented support copilots, including prompt versioning, rubric-based scoring, and escalation tracing.",
          "Used streaming event capture and analyst feedback loops to compare prompt variants, retrieval strategies, and grounding quality.",
          "Helped product leadership decide when the copilot was reliable enough for limited production rollout."
        ),
        repoUrl: "https://github.com/priya-natarajan-demo/support-copilot-eval",
        status: "In Progress",
        isActive: true,
        skillKeys: ["python", "vertexai", "fastapi", "kafka", "docker", "pandas"],
      },
    ],
    experiences: [
      {
        key: "lattice-ai",
        organization: "Lattice AI Systems",
        role: "Machine Learning Engineer",
        description: paragraph(
          "Delivered production ML systems spanning experiment tracking, feature pipelines, inference APIs, and monitoring."
        ),
        achievement: paragraph(
          "Built reusable training orchestration patterns, standardized offline and online evaluation, and partnered with platform teams to operationalize model releases."
        ),
        startDate: "2022-01-01",
        skillKeys: ["python", "pytorch", "airflow", "mlflow", "fastapi", "docker"],
      },
      {
        key: "orbit-finance",
        organization: "Orbit Finance",
        role: "Senior Data Scientist",
        description: paragraph(
          "Worked on risk modeling, portfolio analytics, and experiment design for lending and customer lifecycle products."
        ),
        achievement: paragraph(
          "Improved interpretability for credit risk workflows and established stronger collaboration patterns between analytics, policy, and engineering teams."
        ),
        startDate: "2019-03-01",
        endDate: "2021-12-01",
        skillKeys: ["python", "sql", "dbt", "bigquery", "tensorflow", "pandas"],
      },
      {
        key: "insight-collective",
        organization: "Insight Collective",
        role: "Analytics Engineer",
        description: paragraph(
          "Built trustworthy data models and reporting workflows for growth, marketing, and customer support teams."
        ),
        achievement: paragraph(
          "Established source-of-truth metrics, productionized Airflow jobs, and reduced dashboard drift through versioned data contracts."
        ),
        startDate: "2016-07-01",
        endDate: "2019-02-01",
        skillKeys: ["sql", "airflow", "dbt", "bigquery", "pandas"],
      },
    ],
    certificates: [
      {
        key: "tensorflow-cert",
        name: "TensorFlow Developer Certificate",
        year: "2024",
      },
      {
        key: "gcp-ml",
        name: "Professional Machine Learning Engineer",
        year: "2025",
      },
    ],
    awards: [
      {
        key: "forecasting-award",
        name: "Forecasting Impact Award",
        desc: "Recognized for improving retail demand forecast accuracy during major seasonal campaigns.",
      },
    ],
    resumes: [
      {
        versionName: "ML Engineer @ Nexa Retail AI",
        targetJobTitle: "Machine Learning Engineer",
        targetCompany: "Nexa Retail AI",
        visibility: "public",
        status: "Published",
        isActive: true,
        profileSummary: paragraph(
          "Machine Learning Engineer with experience productionizing forecasting, explainability, and evaluation systems for high-stakes product teams."
        ),
        headline: "ML engineer for production-grade data and inference systems",
        summary: paragraph(
          "Engineer and data scientist with strong foundations in modeling, experimentation, and ML platform delivery.",
          "Brings together feature pipelines, evaluation discipline, and API-driven deployment practices."
        ),
        skillKeys: [
          "python",
          "sql",
          "pytorch",
          "airflow",
          "mlflow",
          "fastapi",
          "docker",
          "vertexai",
        ],
        projectKeys: ["demand-forecasting", "support-copilot"],
        experienceKeys: ["lattice-ai", "orbit-finance"],
        certificateKeys: ["tensorflow-cert", "gcp-ml"],
        awardKeys: ["forecasting-award"],
      },
      {
        versionName: "Senior Data Scientist @ ClearRisk",
        targetJobTitle: "Senior Data Scientist",
        targetCompany: "ClearRisk",
        visibility: "public",
        status: "Draft",
        isActive: false,
        profileSummary: paragraph(
          "Senior Data Scientist focused on interpretable decision systems, trustworthy experimentation, and strong collaboration with business stakeholders."
        ),
        headline: "Senior Data Scientist for decision intelligence products",
        summary: paragraph(
          "Data scientist experienced in risk modeling, feature development, and explainable ML workflows for operational teams.",
          "Enjoys building models that are both measurable and understandable to non-technical partners."
        ),
        skillKeys: [
          "python",
          "sql",
          "tensorflow",
          "dbt",
          "bigquery",
          "pandas",
        ],
        projectKeys: ["credit-risk", "demand-forecasting"],
        experienceKeys: ["orbit-finance", "insight-collective"],
        certificateKeys: ["tensorflow-cert"],
        awardKeys: ["forecasting-award"],
      },
    ],
  },
  {
    email: "john.doe.demo@uaps.local",
    name: "John Doe",
    githubLogin: "johndoe-demo",
    githubId: "demo-johndoe-002",
    githubUrl: "https://github.com/johndoe-demo",
    avatarUrl: "https://avatars.githubusercontent.com/u/2002002?v=4",
    location: "London",
    phone: "+44 7700 900000",
    linkedinUrl: "https://linkedin.com/in/johndoe-demo",
    portfolioUrl: "https://johndoe-demo.dev",
    skills: [
      {
        key: "python",
        name: "Python",
        category: "programming",
        proficiencyLevel: "Expert",
      },
      {
        key: "machine-learning",
        name: "Machine Learning",
        category: "data",
        proficiencyLevel: "Advanced",
      },
    ],
    projects: [
      {
        key: "ai-agent",
        title: "Autonomous AI Agent",
        description: "Built an autonomous AI agent capable of generating its own code using LLMs.",
        repoUrl: "https://github.com/johndoe-demo/ai-agent",
        status: "Completed",
        isActive: true,
        skillKeys: ["python", "machine-learning"],
      }
    ],
    experiences: [],
    certificates: [],
    awards: [],
    resumes: [
      {
        versionName: "Data Scientist Resume",
        targetJobTitle: "Senior Data Scientist",
        targetCompany: "OpenAI",
        visibility: "public",
        status: "Published",
        isActive: true,
        profileSummary: "Data scientist with 5 years of experience.",
        headline: "AI Researcher",
        summary: "Passionate about building AI agents.",
        skillKeys: ["python", "machine-learning"],
        projectKeys: ["ai-agent"],
        experienceKeys: [],
        certificateKeys: [],
        awardKeys: [],
      },
    ],
  },
];

const main = async () => {
  console.log("[seed:vault-test] Seeding rich resume-builder demo data...");

  const results: Array<{
    awards: number;
    certificates: number;
    email: string;
    name: string;
    experiences: number;
    projects: number;
    resumes: number;
    skills: number;
  }> = [];

  for (const profile of profiles) {
    const seededProfile = await prisma.$transaction(
      async (transactionClient: Prisma.TransactionClient) => {
        const user = await transactionClient.user.upsert({
        where: { email: profile.email },
        update: {
          name: profile.name,
          githubId: profile.githubId,
          githubLogin: profile.githubLogin,
          githubUrl: profile.githubUrl,
          avatarUrl: profile.avatarUrl,
        },
        create: {
          name: profile.name,
          email: profile.email,
          githubId: profile.githubId,
          githubLogin: profile.githubLogin,
          githubUrl: profile.githubUrl,
          avatarUrl: profile.avatarUrl,
        },
      });

      await transactionClient.resume.deleteMany({
        where: { userId: user.userId },
      });
      await transactionClient.project.deleteMany({
        where: { userId: user.userId },
      });
      await transactionClient.experience.deleteMany({
        where: { userId: user.userId },
      });
      await transactionClient.certificate.deleteMany({
        where: { userId: user.userId },
      });
      await transactionClient.award.deleteMany({
        where: { userId: user.userId },
      });
      await transactionClient.userSkill.deleteMany({
        where: { userId: user.userId },
      });

      const skillIdByKey = new Map<string, string>();
      for (const skill of profile.skills) {
        const createdSkill = await transactionClient.skill.upsert({
          where: { name: skill.name },
          update: {
            category: skill.category,
          },
          create: {
            name: skill.name,
            category: skill.category,
          },
        });

        skillIdByKey.set(skill.key, createdSkill.skillId);

        await transactionClient.userSkill.create({
          data: {
            userId: user.userId,
            skillId: createdSkill.skillId,
            proficiencyLevel: skill.proficiencyLevel,
          },
        });
      }

      const projectIdByKey = new Map<string, string>();
      for (const project of profile.projects) {
        const createdProject = await transactionClient.project.create({
          data: {
            userId: user.userId,
            title: project.title,
            description: project.description,
            repoUrl: project.repoUrl,
            status: project.status,
            isActive: project.isActive,
          },
        });

        projectIdByKey.set(project.key, createdProject.projectId);

        if (project.skillKeys.length > 0) {
          await transactionClient.projectSkill.createMany({
            data: project.skillKeys.map((skillKey) => {
              const skillId = skillIdByKey.get(skillKey);

              if (!skillId) {
                throw new Error(`Missing seeded skill for key: ${skillKey}`);
              }

              return {
                projectId: createdProject.projectId,
                skillId,
              };
            }),
          });
        }
      }

      const experienceIdByKey = new Map<string, string>();
      for (const experience of profile.experiences) {
        const createdExperience = await transactionClient.experience.create({
          data: {
            userId: user.userId,
            organization: experience.organization,
            role: experience.role,
            description: experience.description,
            achievement: experience.achievement,
            startDate: isoDate(experience.startDate),
            endDate: experience.endDate ? isoDate(experience.endDate) : null,
          },
        });

        experienceIdByKey.set(experience.key, createdExperience.experienceId);

        if (experience.skillKeys.length > 0) {
          await transactionClient.experienceSkill.createMany({
            data: experience.skillKeys.map((skillKey) => {
              const skillId = skillIdByKey.get(skillKey);

              if (!skillId) {
                throw new Error(`Missing seeded skill for key: ${skillKey}`);
              }

              return {
                experienceId: createdExperience.experienceId,
                skillId,
              };
            }),
          });
        }
      }

      const certificateIdByKey = new Map<string, string>();
      for (const certificate of profile.certificates) {
        const createdCertificate = await transactionClient.certificate.create({
          data: {
            userId: user.userId,
            name: certificate.name,
            year: certificate.year,
          },
        });

        certificateIdByKey.set(
          certificate.key,
          createdCertificate.certificateId,
        );
      }

      const awardIdByKey = new Map<string, string>();
      for (const award of profile.awards) {
        const createdAward = await transactionClient.award.create({
          data: {
            userId: user.userId,
            name: award.name,
            description: award.desc,
          },
        });

        awardIdByKey.set(award.key, createdAward.awardId);
      }

      for (const resume of profile.resumes) {
        const createdResume = await transactionClient.resume.create({
          data: {
            userId: user.userId,
            versionName: resume.versionName,
            targetJobTitle: resume.targetJobTitle,
            targetCompany: resume.targetCompany,
            visibility: resume.visibility,
            profileSummary: resume.profileSummary,
            location: profile.location,
            phone: profile.phone,
            linkedinUrl: profile.linkedinUrl,
            portfolioUrl: profile.portfolioUrl,
            isActive: resume.isActive,
            status: resume.status,
            resumeBasic: {
              create: {
                fullName: profile.name,
                headline: resume.headline,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                linkedinUrl: profile.linkedinUrl,
                portfolioUrl: profile.portfolioUrl,
                githubUrl: profile.githubUrl,
                summary: resume.summary,
              },
            },
          },
        });

        if (resume.skillKeys.length > 0) {
          await transactionClient.resumeSkill.createMany({
            data: resume.skillKeys.map((skillKey) => {
              const skillId = skillIdByKey.get(skillKey);

              if (!skillId) {
                throw new Error(`Missing seeded skill for key: ${skillKey}`);
              }

              return {
                resumeId: createdResume.resumeId,
                skillId,
              };
            }),
          });
        }

        if (resume.projectKeys.length > 0) {
          await transactionClient.resumeProject.createMany({
            data: resume.projectKeys.map((projectKey) => {
              const projectId = projectIdByKey.get(projectKey);

              if (!projectId) {
                throw new Error(`Missing seeded project for key: ${projectKey}`);
              }

              return {
                resumeId: createdResume.resumeId,
                projectId,
              };
            }),
          });
        }

        if (resume.experienceKeys.length > 0) {
          await transactionClient.resumeExperience.createMany({
            data: resume.experienceKeys.map((experienceKey) => {
              const experienceId = experienceIdByKey.get(experienceKey);

              if (!experienceId) {
                throw new Error(
                  `Missing seeded experience for key: ${experienceKey}`,
                );
              }

              return {
                resumeId: createdResume.resumeId,
                experienceId,
              };
            }),
          });
        }

        if (resume.certificateKeys.length > 0) {
          await transactionClient.resumeCertificate.createMany({
            data: resume.certificateKeys.map((certificateKey) => {
              const certificateId = certificateIdByKey.get(certificateKey);

              if (!certificateId) {
                throw new Error(
                  `Missing seeded certificate for key: ${certificateKey}`,
                );
              }

              return {
                resumeId: createdResume.resumeId,
                certificateId,
              };
            }),
          });
        }

        if (resume.awardKeys.length > 0) {
          await transactionClient.resumeAward.createMany({
            data: resume.awardKeys.map((awardKey) => {
              const awardId = awardIdByKey.get(awardKey);

              if (!awardId) {
                throw new Error(`Missing seeded award for key: ${awardKey}`);
              }

              return {
                resumeId: createdResume.resumeId,
                awardId,
              };
            }),
          });
        }
      }

      return {
        awards: profile.awards.length,
        certificates: profile.certificates.length,
        name: profile.name,
        email: profile.email,
        skills: profile.skills.length,
        projects: profile.projects.length,
        experiences: profile.experiences.length,
        resumes: profile.resumes.length,
      };
      },
      { timeout: 60000, maxWait: 30000 }
    );

    results.push(seededProfile);
    console.log(
      `[seed:vault-test] Seeded ${seededProfile.name} (${seededProfile.email}) with ${seededProfile.resumes} resumes, ${seededProfile.certificates} certificates, and ${seededProfile.awards} awards.`,
    );
  }

  console.table(results);
  console.log("[seed:vault-test] Done.");
};

void main()
  .catch((error: unknown) => {
    console.error("[seed:vault-test] Failed to seed demo data.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
