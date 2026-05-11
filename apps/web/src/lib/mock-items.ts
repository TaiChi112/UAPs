export type Skill = { skillId: string; name: string; category?: string };
export type Project = { projectId: string; title: string; description?: string; status?: string };
export type MockResume = { id: string; title: string; updatedAt: string; skills: Skill[]; projects: Project[] };

export const mockSkills: Skill[] = [
  { skillId: "s1", name: "TypeScript", category: "Language" },
  { skillId: "s2", name: "Python", category: "Language" },
  { skillId: "s3", name: "Next.js", category: "Framework" },
  { skillId: "s4", name: "Docker", category: "DevOps" },
  { skillId: "s5", name: "Prisma", category: "Database" },
  { skillId: "s6", name: "Kubernetes", category: "DevOps" },
  { skillId: "s7", name: "React", category: "Framework" },
];

export const mockProjects: Project[] = [
  {
    projectId: "p1",
    title: "Design Pattern Playground",
    description: "Examples of design patterns in TS",
    status: "Completed",
  },
  {
    projectId: "p2",
    title: "UAPS - Portfolio System",
    description: "Dynamic resume generator",
    status: "In Progress",
  },
  { projectId: "p3", title: "Project Scaffolding CLI", description: "CLI for project templates", status: "MVP" },
  { projectId: "p4", title: "MLOps Pipeline", description: "CI/CD for ML models", status: "Prototype" },
];

export const mockResumes: MockResume[] = [
  { id: "r1", title: "AI Engineer · Company A", updatedAt: "2026-04-28", skills: [], projects: [] },
  { id: "r2", title: "AI Engineer · Company B", updatedAt: "2026-04-15", skills: [], projects: [] },
  { id: "r3", title: "Software Engineer · Company C", updatedAt: "2026-03-30", skills: [], projects: [] },
];
