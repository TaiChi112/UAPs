import { readFileSync, writeFileSync } from "fs";

// 1. raw-vault.repository.ts
let raw = readFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", "utf8");
// Fix BasicInfoRow missing linkedin
raw = raw.replace(/github: string;/g, "linkedin: string;");
raw = raw.replace(/email: string;\n  linkedin: string;/g, "email: string;\n  github: string;\n  linkedin: string;");
raw = raw.replace(/github_url: string \| null;/g, "linkedin_url: string | null;");
raw = raw.replace(/github: string;/g, ""); // wait, BasicInfoRow never had linkedin, it had github. Let me just add it.

raw = raw.replace(
  /type BasicInfoRow = \{\n  email: string;\n  github: string;\n  name: string;\n  phone: string;\n\};/,
  "type BasicInfoRow = {\n  email: string;\n  linkedin: string;\n  name: string;\n  phone: string;\n};"
);

raw = raw.replace(
  /type UserProfileRow = \{\n  email: string;\n  github_url: string \| null;\n  name: string;\n  phone: string \| null;\n\};/,
  "type UserProfileRow = {\n  email: string;\n  linkedin_url: string | null;\n  name: string;\n  phone: string | null;\n};"
);

// Fix mapped object missing linkedin (around line 142)
raw = raw.replace(/github: basicInfo\.github,/g, "linkedin: basicInfo.linkedin,");

// Add missing interface methods to RawVaultRepository class (end of file)
raw = raw.replace(
  /  \}\n\}\n$/m,
  "  }\n\n  async getPublicResumes(): Promise<import(\"@uaps/shared/resume-builder\").SavedResume[]> { throw new Error(\"Not implemented\"); }\n  async updateResumeVisibility(userId: string, resumeId: import(\"@uaps/shared/resume-builder\").ResumeId, visibility: string): Promise<import(\"@uaps/shared/resume-builder\").SavedResume | null> { throw new Error(\"Not implemented\"); }\n}\n"
);

// Fix ProjectRow missing project_url (or use projectUrl in DB? Wait, let me add projectUrl)
raw = raw.replace(
  /type ProjectRow = \{\n  description: string \| null;\n  project_id: string;\n  title: string;\n\};/,
  "type ProjectRow = {\n  description: string | null;\n  project_id: string;\n  title: string;\n  project_url: string | null;\n};"
);

// Fix ResumeRow missing visibility
raw = raw.replace(
  /type ResumeRow = \{\n  resume_id: string;\n  status: string;\n  summary: string \| null;\n  target_company: string \| null;\n  target_job_title: string \| null;\n  updated_at: Date \| string;\n  version_name: string;\n\};/,
  "type ResumeRow = {\n  resume_id: string;\n  status: string;\n  summary: string | null;\n  target_company: string | null;\n  target_job_title: string | null;\n  updated_at: Date | string;\n  version_name: string;\n  visibility: string | null;\n};"
);

writeFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", raw);

// 2. resume-builder-export.mapper.test.ts
let mapperTest = readFileSync("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", "utf8");
mapperTest = mapperTest.replace(/github: "testgithub"/g, "linkedin: \"testgithub\"");
mapperTest = mapperTest.replace(/role: "Developer",/g, "duration: \"\",\n      projectUrl: \"\",");
mapperTest = mapperTest.replace(/selectedAwards: \[\]/g, "selectedAwards: [],\n      sectionOrder: []");
mapperTest = mapperTest.replace(/status: "Applied",\n\s*config:/g, "status: \"Applied\",\n    visibility: \"private\",\n    config:");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", mapperTest);

// 3. resume-builder-pdf.renderer.test.ts
let pdfTest = readFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", "utf8");
pdfTest = pdfTest.replace(/awards: \[\],\n\s*awards: \[\],\n\s*sectionOrder: \[\],/g, "awards: [],\n  sectionOrder: [],");
pdfTest = pdfTest.replace(/awards: \[\],\n\s*sectionOrder: \[\],\n\s*sectionOrder: \[\],/g, "awards: [],\n  sectionOrder: [],");
// to be safe, just clear any duplicates
let splitPdfTest = pdfTest.split("awards: [],");
if (splitPdfTest.length > 1) {
  // It should be: "awards: [],\n  sectionOrder: [],"
  let rest = splitPdfTest.slice(1).join("awards: [],");
  rest = rest.replace(/\s*sectionOrder: \[\],/g, "");
  rest = "\n  sectionOrder: []," + rest;
  pdfTest = splitPdfTest[0] + "awards: []," + rest;
}
writeFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", pdfTest);
