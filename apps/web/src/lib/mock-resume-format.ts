export type ResumeProjectItem = {
  title: string;
  date: string;
  tag: string;
  problem: string;
  solution: string;
};

export type ResumeSkillGroup = {
  label: string;
  items: string[];
};

export type ResumeEducation = {
  degree: string;
  institution: string;
  graduation: string;
  coursework: string[];
};

export type ResumeFormatData = {
  fullName: string;
  targetRole: string;
  location: string;
  email: string;
  phone: string;
  links: Array<{ label: string; value: string }>;
  summary: string;
  projects: ResumeProjectItem[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation;
  additionalInfo: string[];
};

export const mockResumeFormat: ResumeFormatData = {
  fullName: "Narin Techapong",
  targetRole: "Software Engineer Intern / Agentic Software Engineer Intern",
  location: "Bangkok, Thailand",
  email: "narin.techapong@gmail.com",
  phone: "+66 91 234 5678",
  links: [
    { label: "LinkedIn", value: "linkedin.com/in/narin-techapong" },
    { label: "GitHub", value: "github.com/narintech" },
    { label: "Portfolio", value: "narinworks.dev" },
  ],
  summary:
    "Computer Science student passionate about combining AI technologies with systematic software development. Strong in TypeScript and Python, with focus on practical AI-assisted engineering, clean architecture, and reliable software delivery.",
  projects: [
    {
      title: "Design Pattern Playground",
      date: "18/01/2026",
      tag: "REFACTOR",
      problem: "Learning advanced software design patterns often lacks practical, front-end oriented examples.",
      solution:
        "Built a TypeScript + Next.js web app that demonstrates Factory, Builder, and Visitor patterns in realistic features, resulting in cleaner extension points and lower maintenance overhead.",
    },
    {
      title: "Universal Academic Portfolio System",
      date: "29/03/2026",
      tag: "REFACTOR",
      problem: "A single static resume for different roles reduces chance of matching company-specific requirements.",
      solution:
        "Designed relational data models and a dynamic resume generator that maps candidate data to target job descriptions, preparing the foundation for future AI-driven matching.",
    },
    {
      title: "Project Scaffolding CLI",
      date: "12/04/2026",
      tag: "MVP",
      problem: "Creating new project structures requires repetitive setup and manual configuration.",
      solution:
        "Implemented a CLI to automate boilerplate generation with modular templates, enabling fast project initialization and easier team standardization.",
    },
  ],
  skills: [
    { label: "Language", items: ["TypeScript", "Python", "C++", "Go"] },
    { label: "Framework & Tools", items: ["Next.js", "Express", "Elysia", "Prisma", "FastAPI", "Docker"] },
    { label: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "SQL", "NoSQL"] },
    {
      label: "Other",
      items: ["MCP", "Git", "GitHub", "System Design", "SOLID", "SDLC"],
    },
    {
      label: "Working Style & Soft Skills",
      items: ["Design-first", "Strategic problem solving", "Adaptability", "Technical communication"],
    },
  ],
  education: {
    degree: "Computer Science",
    institution: "Ramkhamhaeng University, Faculty of Science",
    graduation: "Expected Graduation: 2027",
    coursework: [
      "Software Engineering",
      "Algorithm Design and Analysis",
      "System Analysis and Design",
      "Data Mining",
      "Database",
      "Design Pattern",
    ],
  },
  additionalInfo: ["Language Proficiency: Thai (Native), English (Intermediate)"],
};
