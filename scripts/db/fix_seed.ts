import { readFileSync, writeFileSync } from "fs";

let seed = readFileSync("apps/api/scripts/seed-vault-test.ts", "utf8");

// 1. In SeedProject type, repoUrl -> projectUrl
seed = seed.replace(/repoUrl\?: string;/g, "projectUrl?: string;");
// 2. In SeedProfile type, githubUrl -> linkedinUrl
seed = seed.replace(/githubUrl\?: string;/g, "linkedinUrl?: string;");
// 3. In the big seed array, replace githubUrl with linkedinUrl and repoUrl with projectUrl
seed = seed.replace(/githubUrl: /g, "linkedinUrl: ");
seed = seed.replace(/repoUrl: /g, "projectUrl: ");

// 4. In db.user.create/update, githubLogin does not exist on Prisma schema anymore?
// Wait, I didn't delete githubLogin, I just deleted githubUrl!
// githubLogin STILL exists on User schema? No, it exists on ResumeBasic.
// But the error is "linkedinUrl does not exist in type UserCreateInput"
// This is because we replaced githubUrl with linkedinUrl, but githubUrl was never on UserCreateInput!
// Wait! If githubUrl was on SeedProfile, and passed to db.user.create?
// Let's look at what was originally on line 928 and 936!
// Oh, the original code had:
// githubLogin: profile.githubUrl
// Wait, NO! User schema has `githubLogin`? Let's check schema.prisma!
// Wait, User does not have githubLogin. Wait, YES IT DOES?
// I will check schema.prisma!

writeFileSync("apps/api/scripts/seed-vault-test.ts", seed);
