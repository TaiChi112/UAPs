"use client";

import Link from "next/link";
import { useState } from "react";
import { mockResumeFormat } from "@/lib/mock-resume-format";

type MockResumeProduct = {
  id: string;
  jobTitle: string;
  company: string;
  updatedAt: string;
  highlights: string[];
};

const mockResumeProductsInitial: MockResumeProduct[] = [
  {
    id: "resume-01",
    jobTitle: "AI Engineer",
    company: "Company A",
    updatedAt: "2026-04-28",
    highlights: ["Latest version", "Focused on GenAI delivery", "Ready to export"],
  },
  {
    id: "resume-02",
    jobTitle: "AI Engineer",
    company: "Company B",
    updatedAt: "2026-04-15",
    highlights: ["Same position, different company", "Emphasis on MLOps", "Archived copy"],
  },
  {
    id: "resume-03",
    jobTitle: "Software Engineer",
    company: "Company C",
    updatedAt: "2026-03-30",
    highlights: ["Different position, same company", "Backend-heavy profile", "Interview version"],
  },
  {
    id: "resume-04",
    jobTitle: "Cloud Engineer",
    company: "Company C",
    updatedAt: "2026-02-18",
    highlights: ["Different position, same company", "Cloud architecture focus", "Exportable copy"],
  },
];

export default function ResumeListPage() {
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resumes, setResumes] = useState<MockResumeProduct[]>(mockResumeProductsInitial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");

  const handlePreview = (resumeId: string) => {
    setPreviewResumeId((current) => (current === resumeId ? null : resumeId));
    setMessage(null);
  };

  const handleExport = (title: string) => {
    setMessage(`Mock export started for ${title}`);
  };

  const beginEdit = (r: MockResumeProduct) => {
    setEditingId(r.id);
    setEditJobTitle(r.jobTitle);
    setEditCompany(r.company);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditJobTitle("");
    setEditCompany("");
  };

  const saveEdit = (id: string) => {
    setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, jobTitle: editJobTitle, company: editCompany } : r)));
    setMessage("Saved resume metadata (mock)");
    cancelEdit();
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Resume / CV</p>
        <h2 className="section-title">Resume Product Shelf (Mock)</h2>
        <p className="subtle">View each resume as a product card. Expand only when you want to preview details or export.</p>
        <div className="action-row">
          <Link href="/resume/format-preview" className="btn-secondary">
            Open PDF Style Format Preview
          </Link>
          <Link href="/resume/mock-editor" className="btn-secondary">
            Open Mock Resume Editor
          </Link>
        </div>
      </div>

      {message ? <article className="card success-text">{message}</article> : null}

      <article className="card stack gap-sm resume-product-wall">
        <h3>All Resume Versions</h3>
        <p className="subtle">Simple black-and-white view for now. Customization can be added as a future feature.</p>

        {resumes.map((resume) => (
          <details key={resume.id} className="resume-product-card">
            <summary className="resume-product-summary">
              {editingId === resume.id ? (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input className="input" value={editJobTitle} onChange={(e) => setEditJobTitle(e.target.value)} />
                  <input className="input" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
                </div>
              ) : (
                <span className="resume-product-title">{resume.jobTitle} · {resume.company}</span>
              )}
              <span className="resume-product-date">Updated {resume.updatedAt}</span>
            </summary>

            <div className="stack gap-sm resume-product-panel">
              <ul className="resume-product-points">
                {resume.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="inline-list">
                {editingId === resume.id ? (
                  <>
                    <button className="btn-primary" type="button" onClick={() => saveEdit(resume.id)}>
                      Save
                    </button>
                    <button className="btn-secondary" type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-secondary" type="button" onClick={() => handlePreview(resume.id)}>
                      Preview Full Resume
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => beginEdit(resume)}>
                      Edit Title/Company
                    </button>
                    <button className="btn-primary" type="button" onClick={() => handleExport(`${resume.jobTitle} · ${resume.company}`)}>
                      Export (Mock)
                    </button>
                  </>
                )}
              </div>

              {previewResumeId === resume.id ? (
                <article className="resume-doc">
                  <header className="resume-doc-header stack gap-sm">
                    <h1>{mockResumeFormat.fullName}</h1>
                    <p className="resume-role">{mockResumeFormat.targetRole}</p>

                    <div className="resume-contact-line">
                      <span>{mockResumeFormat.location}</span>
                      <span>{mockResumeFormat.email}</span>
                      <span>{mockResumeFormat.phone}</span>
                    </div>

                    <div className="resume-link-line">
                      {mockResumeFormat.links.map((link) => (
                        <span key={link.label}>
                          {link.label}: {link.value}
                        </span>
                      ))}
                    </div>
                  </header>

                  <section className="stack gap-sm">
                    <h3 className="resume-section-title">Summary</h3>
                    <p>{mockResumeFormat.summary}</p>
                  </section>

                  <section className="stack gap-sm">
                    <h3 className="resume-section-title">Projects</h3>
                    {mockResumeFormat.projects.map((project) => (
                      <article key={project.title} className="stack gap-sm resume-project-item">
                        <div className="resume-project-title-row">
                          <h4>{project.title}</h4>
                          <p>
                            {project.date} | {project.tag}
                          </p>
                        </div>

                        <ul className="resume-bullets">
                          <li>
                            <strong>Problem/Motivation:</strong> {project.problem}
                          </li>
                          <li>
                            <strong>Solution/Benefit:</strong> {project.solution}
                          </li>
                        </ul>
                      </article>
                    ))}
                  </section>

                  <section className="stack gap-sm">
                    <h3 className="resume-section-title">Skills</h3>
                    <ul className="resume-bullets">
                      {mockResumeFormat.skills.map((group) => (
                        <li key={group.label}>
                          <strong>{group.label}:</strong> {group.items.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="stack gap-sm">
                    <h3 className="resume-section-title">Education</h3>
                    <div className="stack gap-sm">
                      <p>
                        <strong>{mockResumeFormat.education.degree}</strong>
                      </p>
                      <p>{mockResumeFormat.education.institution}</p>
                      <p>{mockResumeFormat.education.graduation}</p>
                      <ul className="resume-bullets">
                        <li>
                          <strong>Relevant Coursework:</strong> {mockResumeFormat.education.coursework.join(", ")}
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section className="stack gap-sm">
                    <h3 className="resume-section-title">Additional Information</h3>
                    <ul className="resume-bullets">
                      {mockResumeFormat.additionalInfo.map((info) => (
                        <li key={info}>{info}</li>
                      ))}
                    </ul>
                  </section>
                </article>
              ) : null}
            </div>
          </details>
        ))}
      </article>
    </section>
  );
}
