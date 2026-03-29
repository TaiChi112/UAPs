import { Resvg } from "@resvg/resvg-js";
import { PDFDocument } from "pdf-lib";

type Project = {
  title: string;
  status: string;
  description?: string;
};

type Skill = {
  name: string;
  category: string;
  proficiencyLevel?: string;
};

type Experience = {
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type ResumePayload = {
  versionName: string;
  targetJobTitle?: string;
  targetCompany?: string;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const sectionItems = (label: string, rows: string[]) => {
  if (rows.length === 0) {
    return `${label}\n- N/A`;
  }

  return `${label}\n${rows.map((row) => `- ${row}`).join("\n")}`;
};

export const buildResumeMarkdown = (payload: ResumePayload) => {
  return [
    `# ${payload.versionName}`,
    "",
    `- Target Job: ${payload.targetJobTitle ?? "N/A"}`,
    `- Target Company: ${payload.targetCompany ?? "N/A"}`,
    "",
    "## Projects",
    ...payload.projects.map((item) => `- ${item.title} (${item.status})`),
    "",
    "## Skills",
    ...payload.skills.map((item) => `- ${item.name} (${item.category}${item.proficiencyLevel ? `, ${item.proficiencyLevel}` : ""})`),
    "",
    "## Experiences",
    ...payload.experiences.map((item) => `- ${item.role} @ ${item.organization}`),
  ].join("\n");
};

export const buildResumeSvg = (payload: ResumePayload) => {
  const content = [
    `${payload.versionName}`,
    `Role: ${payload.targetJobTitle ?? "N/A"}`,
    `Company: ${payload.targetCompany ?? "N/A"}`,
    "",
    sectionItems(
      "Projects",
      payload.projects.map((item) => `${item.title} (${item.status})${item.description ? ` - ${item.description}` : ""}`),
    ),
    "",
    sectionItems(
      "Skills",
      payload.skills.map((item) => `${item.name} (${item.category}${item.proficiencyLevel ? `, ${item.proficiencyLevel}` : ""})`),
    ),
    "",
    sectionItems(
      "Experiences",
      payload.experiences.map((item) => {
        const duration = item.startDate || item.endDate ? ` [${item.startDate ?? "?"} - ${item.endDate ?? "Present"}]` : "";
        return `${item.role} @ ${item.organization}${duration}${item.description ? ` - ${item.description}` : ""}`;
      }),
    ),
  ].join("\n");

  const escapedContent = escapeXml(content);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1754" viewBox="0 0 1240 1754">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff7e8" />
      <stop offset="100%" stop-color="#f5efe5" />
    </linearGradient>
  </defs>
  <rect width="1240" height="1754" fill="url(#bg)" />
  <rect x="60" y="60" width="1120" height="1634" rx="28" fill="#ffffff" stroke="#1f2a4433" stroke-width="2" />
  <text x="110" y="170" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#1f2a44">${escapeXml(payload.versionName)}</text>
  <text x="110" y="220" font-family="Arial, sans-serif" font-size="28" fill="#ef6c2f">${escapeXml(payload.targetJobTitle ?? "Target Job N/A")}</text>
  <text x="110" y="260" font-family="Arial, sans-serif" font-size="24" fill="#1f2a44">${escapeXml(payload.targetCompany ?? "Target Company N/A")}</text>
  <foreignObject x="110" y="310" width="1020" height="1300">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #24334d; white-space: pre-wrap; font-size: 24px; line-height: 1.55;">
      ${escapedContent}
    </div>
  </foreignObject>
</svg>
`.trim();
};

export const renderResumeImage = (payload: ResumePayload) => {
  const svg = buildResumeSvg(payload);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1240,
    },
  });

  return resvg.render().asPng();
};

export const renderResumePdf = async (payload: ResumePayload) => {
  const pngBytes = renderResumeImage(payload);
  const pdf = await PDFDocument.create();
  const pngImage = await pdf.embedPng(pngBytes);
  const page = pdf.addPage([pngImage.width, pngImage.height]);

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: pngImage.width,
    height: pngImage.height,
  });

  return await pdf.save();
};
