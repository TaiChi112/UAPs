"use client";

import { useEffect, useMemo, useState } from "react";
import {
  composeResume,
  Experience,
  getExperiences,
  getProjects,
  getResumeBaseline,
  getResumePreview,
  getResumes,
  getSkills,
  Project,
  ResumeBaseline,
  Resume,
  ResumePreview,
  Skill,
  upsertResumeBaseline,
} from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

type ComposeState = {
  projectIds: string[];
  skillIds: string[];
  experienceIds: string[];
};

const emptyCompose: ComposeState = {
  projectIds: [],
  skillIds: [],
  experienceIds: [],
};

const emptyBaseline = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  portfolioUrl: "",
  githubUrl: "",
  summary: "",
};

export default function CreateResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [composeState, setComposeState] = useState<ComposeState>(emptyCompose);
  const [preview, setPreview] = useState<ResumePreview | null>(null);
  const [baseline, setBaseline] = useState<Omit<ResumeBaseline, "resumeId" | "updatedAt">>(emptyBaseline);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.resumeId === selectedResumeId) ?? null,
    [resumes, selectedResumeId],
  );

  const load = async () => {
    setError(null);

    try {
      const [resumeData, projectData, skillData, experienceData] = await Promise.all([
        getResumes(),
        getProjects(),
        getSkills(),
        getExperiences(),
      ]);

      setResumes(resumeData);
      setProjects(projectData);
      setSkills(skillData);
      setExperiences(experienceData);

      if (!selectedResumeId && resumeData[0]) {
        setSelectedResumeId(resumeData[0].resumeId);
      }
    } catch {
      setError("Failed to load compose data.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selectedResume) {
      setComposeState(emptyCompose);
      setPreview(null);
      return;
    }

    setComposeState({
      projectIds: selectedResume.projectIds,
      skillIds: selectedResume.skillIds,
      experienceIds: selectedResume.experienceIds,
    });

    void (async () => {
      const [data, baselineData] = await Promise.all([
        getResumePreview(selectedResume.resumeId),
        getResumeBaseline(selectedResume.resumeId),
      ]);
      setPreview(data);
      setBaseline({
        fullName: baselineData?.fullName ?? "",
        headline: baselineData?.headline ?? "",
        email: baselineData?.email ?? "",
        phone: baselineData?.phone ?? "",
        location: baselineData?.location ?? "",
        linkedinUrl: baselineData?.linkedinUrl ?? "",
        portfolioUrl: baselineData?.portfolioUrl ?? "",
        githubUrl: baselineData?.githubUrl ?? "",
        summary: baselineData?.summary ?? "",
      });
    })();
  }, [selectedResume]);

  const toggleId = (target: keyof ComposeState, id: string) => {
    setComposeState((state) => ({
      ...state,
      [target]: state[target].includes(id) ? state[target].filter((item) => item !== id) : [...state[target], id],
    }));
  };

  const handleCompose = async () => {
    if (!selectedResumeId) {
      setError("Select a resume first.");
      return;
    }

    const result = await composeResume(selectedResumeId, composeState);
    if (!result.ok) {
      setError(result.message ?? "Unable to compose resume");
      return;
    }

    setSuccess("Resume composition saved.");
    setError(null);
    setPreview(await getResumePreview(selectedResumeId));
    setResumes(await getResumes());
  };

  const handleBaselineSave = async () => {
    if (!selectedResumeId) {
      setError("Select a resume first.");
      return;
    }

    if (!baseline.fullName.trim()) {
      setError("Full name is required for baseline profile.");
      return;
    }

    const result = await upsertResumeBaseline(selectedResumeId, baseline);
    if (!result.ok) {
      setError(result.message ?? "Unable to save baseline profile");
      return;
    }

    setSuccess("Baseline profile saved.");
    setError(null);
  };

  const exportLink = (format: "json" | "md" | "pdf" | "image") => {
    if (!selectedResumeId) {
      return "#";
    }

    return `${API_BASE_URL}/resumes/${selectedResumeId}/export/${format}`;
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Resume Builder</p>
        <h2 className="section-title">Compose Resume with Real Entity Selection</h2>
        <p className="subtle">Choose projects, skills, and experiences for each resume version.</p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}
      {success ? <article className="card success-text">{success}</article> : null}

      <article className="card stack gap-sm">
        <h3>1) Choose Resume</h3>
        <select className="input" value={selectedResumeId} onChange={(event) => setSelectedResumeId(event.target.value)}>
          <option value="">-- Select resume --</option>
          {resumes.map((resume) => (
            <option key={resume.resumeId} value={resume.resumeId}>
              {resume.versionName}
            </option>
          ))}
        </select>
      </article>

      <article className="card stack gap-sm">
        <h3>2) Baseline Profile (Common to All Resume Versions)</h3>
        <input
          className="input"
          placeholder="Full Name"
          value={baseline.fullName}
          onChange={(event) => setBaseline((state) => ({ ...state, fullName: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Headline"
          value={baseline.headline ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, headline: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Email"
          value={baseline.email ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, email: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Phone"
          value={baseline.phone ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, phone: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Location"
          value={baseline.location ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, location: event.target.value }))}
        />
        <input
          className="input"
          placeholder="LinkedIn URL"
          value={baseline.linkedinUrl ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, linkedinUrl: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Portfolio URL"
          value={baseline.portfolioUrl ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, portfolioUrl: event.target.value }))}
        />
        <input
          className="input"
          placeholder="GitHub URL"
          value={baseline.githubUrl ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, githubUrl: event.target.value }))}
        />
        <textarea
          className="input"
          placeholder="Professional Summary"
          rows={4}
          value={baseline.summary ?? ""}
          onChange={(event) => setBaseline((state) => ({ ...state, summary: event.target.value }))}
        />
        <div className="inline-list">
          <button className="btn-secondary" type="button" onClick={() => void handleBaselineSave()}>
            Save Baseline
          </button>
        </div>
      </article>

      <article className="card stack gap-sm">
        <h3>3) Select Projects</h3>
        <div className="chip-grid">
          {projects.map((project) => (
            <label key={project.projectId} className="chip-select">
              <input
                type="checkbox"
                checked={composeState.projectIds.includes(project.projectId)}
                onChange={() => toggleId("projectIds", project.projectId)}
              />
              {project.title}
            </label>
          ))}
        </div>
      </article>

      <article className="card stack gap-sm">
        <h3>4) Select Skills</h3>
        <div className="chip-grid">
          {skills.map((skill) => (
            <label key={skill.skillId} className="chip-select">
              <input
                type="checkbox"
                checked={composeState.skillIds.includes(skill.skillId)}
                onChange={() => toggleId("skillIds", skill.skillId)}
              />
              {skill.name}
            </label>
          ))}
        </div>
      </article>

      <article className="card stack gap-sm">
        <h3>5) Select Experiences</h3>
        <div className="chip-grid">
          {experiences.map((experience) => (
            <label key={experience.experienceId} className="chip-select">
              <input
                type="checkbox"
                checked={composeState.experienceIds.includes(experience.experienceId)}
                onChange={() => toggleId("experienceIds", experience.experienceId)}
              />
              {experience.role} @ {experience.organization}
            </label>
          ))}
        </div>
      </article>

      <article className="card stack gap-sm">
        <h3>6) Save Composition</h3>
        <button className="btn-primary" type="button" onClick={() => void handleCompose()}>
          Save Compose
        </button>
      </article>

      <article className="card stack gap-sm">
        <h3>7) Export</h3>
        <div className="inline-list">
          <a className="btn-secondary" href={exportLink("json")} target="_blank" rel="noreferrer">
            Export JSON
          </a>
          <a className="btn-secondary" href={exportLink("md")} target="_blank" rel="noreferrer">
            Export Markdown
          </a>
          <a className="btn-secondary" href={exportLink("pdf")} target="_blank" rel="noreferrer">
            Export PDF
          </a>
          <a className="btn-secondary" href={exportLink("image")} target="_blank" rel="noreferrer">
            Export PNG
          </a>
        </div>
      </article>

      <article className="card stack gap-sm">
        <h3>Preview Snapshot</h3>
        {preview ? (
          <>
            <p>
              {preview.versionName} · {preview.targetJobTitle ?? "N/A"} · {preview.targetCompany ?? "N/A"}
            </p>
            <p className="subtle">Projects: {preview.projects.length}</p>
            <p className="subtle">Skills: {preview.skills.length}</p>
            <p className="subtle">Experiences: {preview.experiences.length}</p>
          </>
        ) : (
          <div className="empty-state">
            <p className="subtle">No preview yet. Save baseline and composition to generate a preview.</p>
          </div>
        )}
      </article>
    </section>
  );
}
