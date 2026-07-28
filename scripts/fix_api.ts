import { readFileSync, writeFileSync } from "fs";

function rep(file, a, b) {
  let content = readFileSync(file, "utf8");
  content = content.split(a).join(b);
  writeFileSync(file, content);
}

// 1. Restore the two files to clean state
// (Done via git restore before running this)

// 2. Fix orm-vault.repository.ts
let ormVault = readFileSync("apps/api/src/db/repositories/orm-vault.repository.ts", "utf8");
ormVault = ormVault.replace(/githubUrl: project.repoUrl \?\? undefined/g, "projectUrl: project.projectUrl ?? undefined");
ormVault = ormVault.replace(/repoUrl: input.githubUrl \|\| null/g, "projectUrl: input.projectUrl || null");
ormVault = ormVault.replace(/githubUrl: input.basicInfo.github \|\| null/g, "linkedinUrl: input.basicInfo.linkedin || null");
ormVault = ormVault.replace(/async getPublicResumes\(\): Promise<any> { return \[\]; }\n  async updateResumeVisibility\(\): Promise<boolean> { return true; }\n/g, "");
writeFileSync("apps/api/src/db/repositories/orm-vault.repository.ts", ormVault);

// 3. Fix raw-vault.repository.ts
let rawVault = readFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", "utf8");
rawVault = rawVault.replace(/role: "",/g, `duration: "",\n        projectUrl: project.project_url ?? undefined,`);
rawVault = rawVault.replace(/role: input.role\?\.trim\(\) \|\| "",/g, `duration: "",\n      projectUrl: "",`);
rawVault = rawVault.replace(/summary: resume.summary,/g, `summary: resume.summary,\n        visibility: resume.visibility ?? "private",`);
rawVault = rawVault.replace(/summary: input.config.summary,/g, `summary: input.config.summary,\n        visibility: resume.visibility ?? "private",`);
rawVault = rawVault.replace(/async updateCertificate/g, `async getPublicResumes(): Promise<any> { throw new Error("Not implemented"); }\n  async updateResumeVisibility(): Promise<any> { throw new Error("Not implemented"); }\n  async updateCertificate`);
// also remove duplicate updateResumeStatus if any, but let's just make sure visibility exists on ResumeRow
rawVault = rawVault.replace(/resume_id: string;/g, `resume_id: string;\n  visibility: string;`);
writeFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", rawVault);

// 4. Fix vault-backend.types.ts
rep("apps/api/src/db/repositories/vault-backend.types.ts",
  "updateResumeVisibility(\n    userId: VaultBackendUserId,\n    resumeId: ResumeId,\n    visibility: string,\n  ): Promise<boolean>;",
  "updateResumeVisibility(\n    userId: VaultBackendUserId,\n    resumeId: ResumeId,\n    visibility: string,\n  ): Promise<SavedResume | null>;"
);

// 5. Fix vault-backend.utils.ts
rep("apps/api/src/db/repositories/vault-backend.utils.ts", "github: input.github ?? \"\",", "linkedin: input.linkedin ?? \"\",");

// 6. Fix resume-builder-export.mapper.test.ts
rep("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", "status: \"Applied\",\n    config", "status: \"Applied\",\n    visibility: \"private\",\n    config");

// 7. Fix resume-builder-pdf.renderer.test.ts
rep("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", "awards: [],", "awards: [],\n  sectionOrder: [],");

// 8. Fix resume-builder-pdf.renderer.ts
rep("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", "profile.github", "profile.linkedin");
rep("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", "project.githubUrl", "project.projectUrl");
