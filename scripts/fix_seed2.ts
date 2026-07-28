import { readFileSync, writeFileSync } from "fs";

let seed = readFileSync("apps/api/scripts/seed-vault-test.ts", "utf8");

// 1. Remove githubUrl from ResumeBasic create block (which is around line 1104)
// It looks like: "githubUrl: profile.githubUrl,"
// Let's just remove that exact string globally
seed = seed.replace(/\s*githubUrl: profile\.githubUrl,/g, "");

// 2. In SeedProject type, rename repoUrl to projectUrl
seed = seed.replace(/repoUrl\?: string;/g, "projectUrl?: string;");

// 3. In the mock projects, rename repoUrl to projectUrl
seed = seed.replace(/repoUrl:/g, "projectUrl:");

writeFileSync("apps/api/scripts/seed-vault-test.ts", seed);
