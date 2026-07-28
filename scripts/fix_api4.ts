import { readFileSync, writeFileSync } from "fs";

// 1. orm-vault.repository.ts
let orm = readFileSync("apps/api/src/db/repositories/orm-vault.repository.ts", "utf8");
orm = orm.replace(/github: latestResumeBasic\?\.githubUrl \?\? user\.githubLogin/g, "linkedin: latestResumeBasic?.linkedinUrl ?? \"\"");
orm = orm.replace(/githubUrl: input\.basicInfo\.github \|\| null/g, "linkedinUrl: input.basicInfo.linkedin || null");
writeFileSync("apps/api/src/db/repositories/orm-vault.repository.ts", orm);

// 2. raw-vault.repository.ts
let raw = readFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", "utf8");
raw = raw.replace(/phone: basicInfo\.phone,/g, "phone: basicInfo.phone,\n        linkedin: basicInfo.linkedin_url,");
raw = raw.replace(/project_url: project\.projectUrl/g, "projectUrl: project.project_url");
raw = raw.replace(/visibility: resume\.visibility/g, "visibility: resume.visibility");
raw = raw.replace(/async getPublicResumes\(\): Promise<any> { throw new Error\("Not implemented"\); }\n  async updateResumeVisibility\(\): Promise<import\("@uaps\/shared\/resume-builder"\)\.SavedResume \| null> { throw new Error\("Not implemented"\); }/g, "");
raw = raw.replace(/async updateResumeStatus\(\): Promise<import\("@uaps\/shared\/resume-builder"\)\.SavedResume \| null> { throw new Error\("Not implemented"\); }/g, "async updateResumeStatus(): Promise<import(\"@uaps/shared/resume-builder\").SavedResume | null> { throw new Error(\"Not implemented\"); }\n  async getPublicResumes(): Promise<any> { throw new Error(\"Not implemented\"); }\n  async updateResumeVisibility(): Promise<import(\"@uaps/shared/resume-builder\").SavedResume | null> { throw new Error(\"Not implemented\"); }");
writeFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", raw);

// 3. resume-builder-export.mapper.test.ts
let mapTest = readFileSync("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", "utf8");
mapTest = mapTest.replace(/github: "testgithub",/g, "linkedin: \"testgithub\",");
mapTest = mapTest.replace(/role: "Developer",/g, "duration: \"\",\n      projectUrl: \"\",");
mapTest = mapTest.replace(/selectedAwards: \[\]/g, "selectedAwards: [],\n      sectionOrder: []");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", mapTest);

// 4. resume-builder-pdf.renderer.test.ts
let pdfTest = readFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", "utf8");
pdfTest = pdfTest.replace(/awards: \[\],/g, "awards: [],\n  sectionOrder: [],");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", pdfTest);

// 5. resume-builder-pdf.renderer.ts
let pdfRen = readFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", "utf8");
pdfRen = pdfRen.replace(/profile\.github/g, "profile.linkedin");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", pdfRen);

// 6. seed-vault-test.ts
// Just restore and do exact replaces to avoid duplicates
// I will not touch seed-vault-test.ts here, I will fix it separately via git restore then careful replace
