import { readFileSync, writeFileSync } from "fs";

function rep(file: string, a: RegExp | string, b: string) {
  let content = readFileSync(file, "utf8");
  content = content.replace(a, b);
  writeFileSync(file, content);
}

// 1. seed-vault-test.ts duplicate linkedinUrl
let seed = readFileSync("apps/api/scripts/seed-vault-test.ts", "utf8");
seed = seed.replace(/linkedinUrl:\s*profile\.linkedinUrl,\s*linkedinUrl:\s*profile\.linkedinUrl,/g, "linkedinUrl: profile.linkedinUrl,");
seed = seed.replace(/linkedinUrl:\s*string;\s*linkedinUrl\?:\s*string;/g, "linkedinUrl?: string;");
seed = seed.replace(/linkedinUrl: profile.linkedinUrl,\s*linkedinUrl: profile.linkedinUrl,/g, "linkedinUrl: profile.linkedinUrl,");
seed = seed.replace(/linkedinUrl:\s*profile\.linkedinUrl,\n\s*linkedinUrl:\s*profile\.linkedinUrl,/g, "linkedinUrl: profile.linkedinUrl,");
seed = seed.replace(/linkedinUrl: user.linkedinUrl/g, ""); // User never had githubUrl in Prisma, wait, it had githubLogin!
seed = seed.replace(/linkedinUrl: string/g, "githubLogin?: string"); // wait, I just remove it from user update/create
seed = seed.replace(/linkedinUrl: user\.linkedinUrl,\n/g, "");
seed = seed.replace(/linkedinUrl: user\.linkedinUrl/g, "");
writeFileSync("apps/api/scripts/seed-vault-test.ts", seed);

// 2. orm-vault.repository.ts
let orm = readFileSync("apps/api/src/db/repositories/orm-vault.repository.ts", "utf8");
orm = orm.replace(/githubUrl/g, "linkedinUrl");
orm = orm.replace(/linkedinUrl: project\.repoUrl/g, "projectUrl: project.projectUrl");
orm = orm.replace(/repoUrl:/g, "projectUrl:");
orm = orm.replace(/input\.githubUrl/g, "input.projectUrl");
writeFileSync("apps/api/src/db/repositories/orm-vault.repository.ts", orm);

// 3. raw-vault.repository.ts
let raw = readFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", "utf8");
raw = raw.replace(/project\.project_url/g, "project.projectUrl");
raw = raw.replace(/project\.repo_url/g, "project.projectUrl");
writeFileSync("apps/api/src/db/repositories/raw-vault.repository.ts", raw);

// 4. vault-backend.utils.ts
let utils = readFileSync("apps/api/src/db/repositories/vault-backend.utils.ts", "utf8");
utils = utils.replace(/github: string \| null \| undefined;/g, "linkedin: string | null | undefined;");
writeFileSync("apps/api/src/db/repositories/vault-backend.utils.ts", utils);

// 5. resume-builder-export.mapper.test.ts
let mapperTest = readFileSync("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", "utf8");
mapperTest = mapperTest.replace(/status: "Applied",\n\s*config:/g, "status: \"Applied\",\n    visibility: \"private\",\n    config:");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-export.mapper.test.ts", mapperTest);

// 6. resume-builder-pdf.renderer.test.ts
let pdfTest = readFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", "utf8");
pdfTest = pdfTest.replace(/awards: \[\],/g, "awards: [],\n  sectionOrder: [],");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.test.ts", pdfTest);

// 7. resume-builder-pdf.renderer.ts
let pdfRenderer = readFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", "utf8");
pdfRenderer = pdfRenderer.replace(/profile\.github/g, "profile.linkedin");
pdfRenderer = pdfRenderer.replace(/project\.githubUrl/g, "project.projectUrl");
writeFileSync("apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts", pdfRenderer);
