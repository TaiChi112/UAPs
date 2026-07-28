import { readFileSync, writeFileSync } from "fs";

function replaceExact(file: string, replacements: [string, string][]) {
  let content = readFileSync(file, "utf8");
  for (const [a, b] of replacements) {
    content = content.split(a).join(b);
  }
  writeFileSync(file, content);
}

// 1. seed-vault-test.ts
replaceExact("apps/api/scripts/seed-vault-test.ts", [
  ["githubUrl: ", "linkedinUrl: "],
  ["repoUrl: ", "projectUrl: "],
]);

// 2. orm-vault.repository.ts
replaceExact("apps/api/src/db/repositories/orm-vault.repository.ts", [
  // fix github mapping
  ["github: latestResumeBasic?.githubUrl ?? user.githubLogin", "linkedin: latestResumeBasic?.linkedinUrl ?? \"\""],
  ["github: input.github ?? \"\",", "linkedin: input.linkedin ?? \"\","],
  // fix project properties
  ["githubUrl: project.repoUrl ?? undefined,", "projectUrl: project.projectUrl ?? undefined,"],
  ["repoUrl: input.githubUrl || null,", "projectUrl: input.projectUrl || null,"],
  // fix resume basic properties
  ["githubUrl: input.basicInfo.github || null,", "linkedinUrl: input.basicInfo.linkedin || null,"],
  // remove duplicates if any (wait, I restored it, there shouldn't be any duplicates at the end)
]);

// 3. raw-vault.repository.ts
replaceExact("apps/api/src/db/repositories/raw-vault.repository.ts", [
  // fix project properties
  ["role: \"\",", "duration: \"\",\n        projectUrl: project.project_url ?? undefined,"],
  ["role: input.role?.trim() || \"\",", "duration: \"\",\n      projectUrl: \"\","],
  ["repo_url: project.githubUrl || null,", "project_url: project.projectUrl || null,"],
  ["githubUrl: project.repo_url ?? undefined,", "projectUrl: project.project_url ?? undefined,"],
  // fix resume basic properties
  ["githubUrl: input.basicInfo.github || null,", "linkedinUrl: input.basicInfo.linkedin || null,"],
  // add visibility to toSavedResume calls
  ["targetCompany: resume.target_company,\n        summary: resume.summary,\n        status: resume.status,", 
   "targetCompany: resume.target_company,\n        summary: resume.summary,\n        visibility: resume.visibility ?? \"private\",\n        status: resume.status,"],
  ["targetCompany: resume.target_company,\n        summary: input.config.summary,\n        status: resume.status,",
   "targetCompany: resume.target_company,\n        summary: input.config.summary,\n        visibility: resume.visibility ?? \"private\",\n        status: resume.status,"],
  // fix BasicInfoRow mapping missing linkedin
  ["phone: basicInfo.phone,", "phone: basicInfo.phone,\n        linkedin: basicInfo.linkedin_url,"],
]);
// append missing methods to raw-vault.repository.ts since we restored it
let rawVault = readFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", "utf8");
rawVault = rawVault.replace("async updateResumeStatus(): Promise<import(\"@uaps/shared/resume-builder\").SavedResume | null> { throw new Error(\"Not implemented\"); }", "async updateResumeStatus(): Promise<import(\"@uaps/shared/resume-builder\").SavedResume | null> { throw new Error(\"Not implemented\"); }\n  async getPublicResumes(): Promise<any> { throw new Error(\"Not implemented\"); }\n  async updateResumeVisibility(): Promise<import(\"@uaps/shared/resume-builder\").SavedResume | null> { throw new Error(\"Not implemented\"); }");
writeFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", rawVault);

// 4. vault-backend.utils.ts
replaceExact("apps/api/src/db/repositories/vault-backend.utils.ts", [
  ["github: string | null | undefined;", "linkedin: string | null | undefined;"],
  ["github: input.github ?? \"\",", "linkedin: input.linkedin ?? \"\","],
]);

// 5. resume-builder-export.mapper.test.ts
replaceExact("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", [
  ["status: \"Applied\",\n    config:", "status: \"Applied\",\n    visibility: \"private\",\n    config:"],
]);

// 6. resume-builder-pdf.renderer.test.ts
replaceExact("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", [
  ["github: \"github.com/somchaicodes\",", "linkedin: \"github.com/somchaicodes\","],
  ["role: \"AI Engineer\",", "duration: \"\","],
  ["awards: [],", "awards: [],\n  sectionOrder: [],"],
]);

// 7. resume-builder-pdf.renderer.ts
replaceExact("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", [
  ["profile.github", "profile.linkedin"],
  ["project.githubUrl", "project.projectUrl"],
]);

// 8. db-factory.ts
replaceExact("apps/api/src/db/repositories/db-factory.ts", [
  // no changes needed if I fixed the types in IVaultBackendRepository to match OrmVaultRepository
]);

// 9. vault-backend.types.ts
replaceExact("apps/api/src/db/repositories/vault-backend.types.ts", [
  ["updateResumeVisibility(\n    userId: VaultBackendUserId,\n    resumeId: ResumeId,\n    visibility: string,\n  ): Promise<boolean>;", 
   "updateResumeVisibility(\n    userId: VaultBackendUserId,\n    resumeId: ResumeId,\n    visibility: string,\n  ): Promise<SavedResume | null>;"],
]);
