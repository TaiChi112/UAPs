import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
} from "@uaps/shared/resume-builder";
import type {
  ResumeConfig,
  SavedResume,
  VaultData,
} from "@uaps/shared/resume-builder";

const SKILL_IDS = {
  python: asSkillId("s1"),
  java: asSkillId("s2"),
  react: asSkillId("s3"),
  tensorflow: asSkillId("s4"),
  aws: asSkillId("s5"),
  docker: asSkillId("s6"),
} as const;

const PROJECT_IDS = {
  ecommerceMicroservices: asProjectId("p1"),
  customerChurnPrediction: asProjectId("p2"),
} as const;

const EXPERIENCE_IDS = {
  techSolutionsInternship: asExperienceId("e1"),
  dataDrivenInternship: asExperienceId("e2"),
} as const;

const CERTIFICATE_IDS = {
  awsDeveloper: asCertificateId("c1"),
  tensorflow: asCertificateId("c2"),
} as const;

const AWARD_IDS = {
  hackathonFirstPlace: asAwardId("a1"),
} as const;

const RESUME_IDS = {
  aiEngineerCompanyA: asResumeId("res-1"),
  softwareEngineerTechFlow: asResumeId("res-2"),
} as const;

export const INITIAL_VAULT_DATA = {
  basicInfo: {
    name: "Somchai Coding",
    email: "somchai.c@example.com",
    phone: "+66 81 234 5678",
    github: "github.com/somchaicodes",
  },
  skills: [
    { id: SKILL_IDS.python, name: "Python", category: "programming" },
    { id: SKILL_IDS.java, name: "Java", category: "programming" },
    { id: SKILL_IDS.react, name: "React", category: "frameworks" },
    {
      id: SKILL_IDS.tensorflow,
      name: "TensorFlow",
      category: "frameworks",
    },
    { id: SKILL_IDS.aws, name: "AWS", category: "tools" },
    { id: SKILL_IDS.docker, name: "Docker", category: "tools" },
  ],
  projects: [
    {
      id: PROJECT_IDS.ecommerceMicroservices,
      title: "E-Commerce Microservices",
      role: "Backend Developer",
      description:
        "Built scalable backend services using Java and Spring Boot.",
    },
    {
      id: PROJECT_IDS.customerChurnPrediction,
      title: "Customer Churn Prediction",
      role: "AI Engineer",
      description:
        "Developed an ML model using Python and TensorFlow with 85% accuracy.",
    },
  ],
  experience: [
    {
      id: EXPERIENCE_IDS.techSolutionsInternship,
      company: "Tech Solutions Inc.",
      role: "Software Engineer Intern",
      duration: "Jun 2024 - Aug 2024",
      responsibilities: "Developed RESTful APIs using Node.js.",
    },
    {
      id: EXPERIENCE_IDS.dataDrivenInternship,
      company: "Data Driven Co.",
      role: "Data Analyst Intern",
      duration: "Jun 2023 - Aug 2023",
      responsibilities:
        "Cleaned and pre-processed large datasets using Python.",
    },
  ],
  certificates: [
    {
      id: CERTIFICATE_IDS.awsDeveloper,
      name: "AWS Certified Developer",
      year: "2025",
    },
    {
      id: CERTIFICATE_IDS.tensorflow,
      name: "DeepLearning.AI TensorFlow",
      year: "2024",
    },
  ],
  awards: [
    {
      id: AWARD_IDS.hackathonFirstPlace,
      name: "1st Place - Hackathon 2025",
      desc: "Built an AI-driven healthcare app.",
    },
  ],
} satisfies VaultData;

export const INITIAL_SAVED_RESUMES = [
  {
    id: RESUME_IDS.aiEngineerCompanyA,
    title: "AI Engineer @ Company A",
    date: "10 May 2026",
    status: "Applied",
    config: {
      targetRole: "AI Engineer",
      targetCompany: "Company A",
      summary:
        "Passionate AI Engineer aiming to leverage machine learning skills to build scalable solutions.",
      selectedSkills: [
        SKILL_IDS.python,
        SKILL_IDS.tensorflow,
        SKILL_IDS.aws,
      ],
      selectedProjects: [PROJECT_IDS.customerChurnPrediction],
      selectedExperience: [EXPERIENCE_IDS.dataDrivenInternship],
      selectedCerts: [CERTIFICATE_IDS.tensorflow],
      selectedAwards: [AWARD_IDS.hackathonFirstPlace],
    },
  },
  {
    id: RESUME_IDS.softwareEngineerTechFlow,
    title: "Software Engineer @ Tech Flow",
    date: "08 May 2026",
    status: "Interviewing",
    config: {
      targetRole: "Software Engineer",
      targetCompany: "Tech Flow",
      summary:
        "Backend-focused developer with experience in microservices and cloud deployment.",
      selectedSkills: [
        SKILL_IDS.java,
        SKILL_IDS.react,
        SKILL_IDS.aws,
        SKILL_IDS.docker,
      ],
      selectedProjects: [PROJECT_IDS.ecommerceMicroservices],
      selectedExperience: [EXPERIENCE_IDS.techSolutionsInternship],
      selectedCerts: [CERTIFICATE_IDS.awsDeveloper],
      selectedAwards: [],
    },
  },
] satisfies SavedResume[];

export const EMPTY_RESUME_CONFIG: ResumeConfig = {
  targetRole: "",
  targetCompany: "",
  summary: "",
  selectedSkills: [],
  selectedProjects: [],
  selectedExperience: [],
  selectedCerts: [],
  selectedAwards: [],
};
