import PDFDocument from "pdfkit";

import type {
  ResumeBuilderExportAward,
  ResumeBuilderExportCertificate,
  ResumeBuilderExportExperience,
  ResumeBuilderExportPayload,
  ResumeBuilderExportProject,
  ResumeBuilderExportSkill,
} from "./resume-builder-export.types";

const COLORS = {
  pageBackground: "#f8fafc",
  cardBackground: "#ffffff",
  cardBorder: "#e2e8f0",
  heading: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  accent: "#2563eb",
  accentSecondary: "#4f46e5",
} as const;

const PAGE_WIDTH = 595.28;
const MIN_PAGE_HEIGHT = 842;
const MEASUREMENT_PAGE_HEIGHT = 12000;
const PAGE_MARGIN = 48;
const CARD_MARGIN = 24;
const CONTENT_INSET = 16;
const CONTENT_MARGIN = PAGE_MARGIN + CONTENT_INSET;

type PdfDocumentInstance = InstanceType<typeof PDFDocument>;

const applyPageChrome = (document: PdfDocumentInstance) => {
  const pageWidth = document.page.width;
  const pageHeight = document.page.height;

  document.save();
  document.rect(0, 0, pageWidth, pageHeight).fill(COLORS.pageBackground);
  document
    .roundedRect(
      CARD_MARGIN,
      CARD_MARGIN,
      pageWidth - CARD_MARGIN * 2,
      pageHeight - CARD_MARGIN * 2,
      18,
    )
    .fillAndStroke(COLORS.cardBackground, COLORS.cardBorder);
  document
    .roundedRect(
      CARD_MARGIN,
      CARD_MARGIN,
      pageWidth - CARD_MARGIN * 2,
      8,
      4,
    )
    .fill(COLORS.accent);
  document.restore();
};

const initializePage = (document: PdfDocumentInstance) => {
  applyPageChrome(document);
  document.x = CONTENT_MARGIN;
  document.y = CONTENT_MARGIN;
  document.font("Helvetica").fillColor(COLORS.body);
};

const writeSectionHeading = (
  document: PdfDocumentInstance,
  title: string,
) => {
  document.moveDown(0.4);
  document.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.heading);
  document.text(title.toUpperCase(), {
    characterSpacing: 0.8,
  });
  const lineY = document.y + 6;
  document
    .save()
    .moveTo(document.page.margins.left, lineY)
    .lineTo(document.page.width - document.page.margins.right, lineY)
    .lineWidth(1)
    .strokeColor(COLORS.cardBorder)
    .stroke();
  document.restore();
  document.y = lineY + 10;
};

const writeParagraph = (document: PdfDocumentInstance, content: string) => {
  document
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.body)
    .text(content, {
      lineGap: 3,
    });
};

const writeMutedLine = (document: PdfDocumentInstance, content: string) => {
  document
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .text(content, {
      lineGap: 2,
    });
};

const writeEmptyState = (document: PdfDocumentInstance, content: string) => {
  document
    .font("Helvetica-Oblique")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(content);
};

const writeBulletItem = (document: PdfDocumentInstance, content: string) => {
  document
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.body)
    .text(`• ${content}`, {
      indent: 10,
      lineGap: 3,
    });
};

const formatSkillsLine = (skills: readonly ResumeBuilderExportSkill[]) =>
  [...new Set(skills.map((skill) => skill.name.trim()).filter(Boolean))].join(
    ", ",
  );

const writeHeader = (
  document: PdfDocumentInstance,
  payload: ResumeBuilderExportPayload,
) => {
  document.font("Helvetica-Bold").fontSize(24).fillColor(COLORS.heading);
  document.text(payload.basicInfo.name, {
    align: "left",
  });

  document
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(COLORS.accentSecondary)
    .text(payload.targetRole || payload.title);

  const subheadingParts = [
    payload.targetCompany.trim(),
    payload.date.trim(),
    payload.status.trim(),
  ].filter((value) => value.length > 0);

  if (subheadingParts.length > 0) {
    writeMutedLine(document, subheadingParts.join("  •  "));
  }

  const contactParts = [
    payload.basicInfo.email.trim(),
    payload.basicInfo.phone.trim(),
    payload.basicInfo.github.trim(),
  ].filter((value) => value.length > 0);

  if (contactParts.length > 0) {
    document.moveDown(0.2);
    document
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLORS.body)
      .text(contactParts.join("  •  "));
  }

  document.moveDown(0.5);
  const accentY = document.y;
  document
    .save()
    .moveTo(document.page.margins.left, accentY)
    .lineTo(document.page.width - document.page.margins.right, accentY)
    .lineWidth(2)
    .strokeColor(COLORS.accent)
    .stroke();
  document.restore();
  document.y = accentY + 14;
};

const writeSummarySection = (
  document: PdfDocumentInstance,
  payload: ResumeBuilderExportPayload,
) => {
  if (!payload.summary.trim()) {
    return;
  }

  writeSectionHeading(document, "Professional Summary");
  writeParagraph(document, payload.summary.trim());
};

const writeSkillsSection = (
  document: PdfDocumentInstance,
  skills: readonly ResumeBuilderExportSkill[],
) => {
  writeSectionHeading(document, "Technical Skills");

  const skillsLine = formatSkillsLine(skills);

  if (!skillsLine) {
    writeEmptyState(document, "No skills selected for this resume.");
    return;
  }

  writeParagraph(document, skillsLine);
};

const writeProjectsSection = (
  document: PdfDocumentInstance,
  projects: readonly ResumeBuilderExportProject[],
) => {
  writeSectionHeading(document, "Selected Projects");

  if (projects.length === 0) {
    writeEmptyState(document, "No projects selected for this resume.");
    return;
  }

  for (const project of projects) {
    document.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.heading);
    document.text(project.title);

    if (project.role.trim()) {
      document.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.accent);
      document.text(project.role.trim());
    }

    if (project.description.trim()) {
      writeBulletItem(document, project.description.trim());
    }

    document.moveDown(0.55);
  }
};

const writeExperienceEntry = (
  document: PdfDocumentInstance,
  experience: ResumeBuilderExportExperience,
) => {
  document.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.heading);
  document.text(`${experience.role}  •  ${experience.company}`);

  if (experience.duration.trim()) {
    writeMutedLine(document, experience.duration.trim());
  }

  if (experience.responsibilities.trim()) {
    writeBulletItem(document, experience.responsibilities.trim());
  }

  document.moveDown(0.55);
};

const writeExperienceSection = (
  document: PdfDocumentInstance,
  experience: readonly ResumeBuilderExportExperience[],
) => {
  writeSectionHeading(document, "Professional Experience");

  if (experience.length === 0) {
    writeEmptyState(document, "No experience entries selected for this resume.");
    return;
  }

  for (const experienceEntry of experience) {
    writeExperienceEntry(document, experienceEntry);
  }
};

const writeCompactListSection = <TEntry extends { name: string }>(
  document: PdfDocumentInstance,
  title: string,
  entries: readonly TEntry[],
  formatEntry: (entry: TEntry) => string,
) => {
  if (entries.length === 0) {
    return;
  }

  writeSectionHeading(document, title);

  for (const entry of entries) {
    writeBulletItem(document, formatEntry(entry));
  }
};

const renderContent = (
  document: PdfDocumentInstance,
  payload: ResumeBuilderExportPayload,
) => {
  initializePage(document);

  writeHeader(document, payload);
  writeSummarySection(document, payload);
  document.moveDown(0.25);
  writeSkillsSection(document, payload.skills);
  document.moveDown(0.15);
  writeProjectsSection(document, payload.projects);
  document.moveDown(0.15);
  writeExperienceSection(document, payload.experience);

  if (payload.certificates.length > 0) {
    document.moveDown(0.15);
    writeCompactListSection(
      document,
      "Certificates",
      payload.certificates,
      (certificate: ResumeBuilderExportCertificate) =>
        certificate.year.trim().length > 0
          ? `${certificate.name} (${certificate.year})`
          : certificate.name,
    );
  }

  if (payload.awards.length > 0) {
    document.moveDown(0.15);
    writeCompactListSection(
      document,
      "Awards",
      payload.awards,
      (award: ResumeBuilderExportAward) => `${award.name}: ${award.desc}`,
    );
  }
};

const createDocument = (
  payload: ResumeBuilderExportPayload,
  pageHeight: number,
) => {
  const document = new PDFDocument({
    autoFirstPage: false,
    compress: false,
    size: [PAGE_WIDTH, pageHeight],
    margin: CONTENT_MARGIN,
    info: {
      Title: payload.title,
      Author: payload.basicInfo.name,
      Subject: "Universal Academic Portfolio System Resume Export",
      Keywords: "resume, uaps, academic portfolio",
      CreationDate: new Date(),
    },
  });

  document.addPage({
    size: [PAGE_WIDTH, pageHeight],
    margin: CONTENT_MARGIN,
  });

  return document;
};

const measureRequiredPageHeight = (payload: ResumeBuilderExportPayload) => {
  const document = createDocument(payload, MEASUREMENT_PAGE_HEIGHT);
  renderContent(document, payload);
  const measuredHeight = Math.max(
    MIN_PAGE_HEIGHT,
    Math.ceil(document.y + PAGE_MARGIN + CONTENT_INSET + CARD_MARGIN),
  );
  document.end();

  return measuredHeight;
};

const buildPdfBuffer = async (document: PdfDocumentInstance) => {
  const chunks: Uint8Array[] = [];

  return await new Promise<Uint8Array>((resolve, reject) => {
    document.on("data", (chunk: Uint8Array) => {
      chunks.push(chunk);
    });
    document.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    document.on("error", (error: Error) => {
      reject(error);
    });
    document.end();
  });
};

export const renderResumeBuilderPdf = async (
  payload: ResumeBuilderExportPayload,
) => {
  const pageHeight = measureRequiredPageHeight(payload);
  const document = createDocument(payload, pageHeight);

  renderContent(document, payload);

  return buildPdfBuffer(document);
};
