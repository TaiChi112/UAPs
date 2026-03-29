"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createRecruiterAccessRequest,
  getRecruiterResumeQuickView,
  RecruiterResumeCard,
  RecruiterResumeQuickView,
  searchRecruiterResumes,
} from "@/lib/api";

type SearchState = {
  jobTitles: string[];
  skills: string[];
  experienceRange: "" | "0-2" | "2-5" | "5-10" | "10+";
  visibility: "" | "public" | "company-only";
};

type RecruiterProfile = {
  companyName: string;
  companyDomain: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterRoleTitle: string;
  positionTitle: string;
  purpose: string;
  requestedVisibility: "read-only" | "export";
};

// Filter options for button-based selection
const JOB_TITLE_OPTIONS = [
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "AI/ML Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Cloud Engineer",
  "Platform Engineer",
];

const SKILL_OPTIONS = [
  "Python",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "React",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "AWS",
  "GCP",
  "Azure",
  "Redis",
  "MongoDB",
  "Go",
  "Java",
  "Rust",
  "PyTorch",
  "TensorFlow",
  "MLOps",
  "GraphQL",
  "REST API",
];

const EXPERIENCE_RANGES = [
  { label: "0-2 years", value: "0-2" as const },
  { label: "2-5 years", value: "2-5" as const },
  { label: "5-10 years", value: "5-10" as const },
  { label: "10+ years", value: "10+" as const },
];

const VISIBILITY_OPTIONS = [
  { label: "All", value: "" as const },
  { label: "Public", value: "public" as const },
  { label: "Company Only", value: "company-only" as const },
];

const initialSearch: SearchState = {
  jobTitles: [],
  skills: [],
  experienceRange: "",
  visibility: "",
};

const initialProfile: RecruiterProfile = {
  companyName: "",
  companyDomain: "",
  recruiterName: "",
  recruiterEmail: "",
  recruiterRoleTitle: "",
  positionTitle: "",
  purpose: "Requesting profile access for candidate screening against role requirements.",
  requestedVisibility: "read-only",
};

type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export default function HrResumeMarketplace({
  eyebrow = "Recruiter Console",
  title = "HR Resume Filter",
  description = "Find owner-approved resumes and filter by role, skills, experience years, and keyword evidence.",
}: Readonly<Props>) {
  const [searchState, setSearchState] = useState<SearchState>(initialSearch);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile>(initialProfile);
  const [resumes, setResumes] = useState<RecruiterResumeCard[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [modalResumeIds, setModalResumeIds] = useState<string[]>([]);
  const [quickViewsById, setQuickViewsById] = useState<Record<string, RecruiterResumeQuickView>>({});
  const [compareResumeIds, setCompareResumeIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedResume = useMemo(
    () => resumes.find((item) => item.resumeId === selectedResumeId) ?? null,
    [resumes, selectedResumeId],
  );

  const runSearch = async () => {
    setError(null);
    setMessage(null);

    try {
      // Map experience range to min years
      const experienceRangeMap: Record<string, number | undefined> = {
        "0-2": 0,
        "2-5": 2,
        "5-10": 5,
        "10+": 10,
      };

      const minExperienceYears = searchState.experienceRange ? experienceRangeMap[searchState.experienceRange] : undefined;

      const data = await searchRecruiterResumes({
        jobTitle: searchState.jobTitles.length > 0 ? searchState.jobTitles[0] : undefined,
        requiredSkills: searchState.skills,
        minExperienceYears,
        visibility: searchState.visibility || undefined,
      });

      setResumes(data);
      setSelectedResumeId(null);
      setQuickViewOpen(false);
      setModalResumeIds([]);
      setCompareResumeIds([]);
    } catch {
      setError("Unable to search resumes right now.");
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialResumes = async () => {
      try {
        const data = await searchRecruiterResumes({});
        if (!active) {
          return;
        }

        setResumes(data);
      } catch {
        if (!active) {
          return;
        }

        setError("Unable to load public recruiter resumes right now.");
      }
    };

    void loadInitialResumes();

    return () => {
      active = false;
    };
  }, []);

  const loadQuickView = async (resumeId: string) => {
    if (quickViewsById[resumeId]) {
      return quickViewsById[resumeId];
    }

    const data = await getRecruiterResumeQuickView(resumeId);
    if (!data) {
      return null;
    }

    setQuickViewsById((state) => ({
      ...state,
      [resumeId]: data,
    }));

    return data;
  };

  const openSingleQuickView = async (resumeId: string) => {
    setError(null);

    try {
      const data = await loadQuickView(resumeId);
      if (!data) {
        setError("Unable to load quick view for this resume.");
        return;
      }

      setModalResumeIds([resumeId]);
      setQuickViewOpen(true);
    } catch {
      setError("Unable to load quick view for this resume.");
    }
  };

  const toggleCompareCandidate = (resumeId: string) => {
    setCompareResumeIds((state) => {
      if (state.includes(resumeId)) {
        return state.filter((id) => id !== resumeId);
      }

      if (state.length >= 2) {
        return [state[1], resumeId];
      }

      return [...state, resumeId];
    });
  };

  const openCompareQuickView = async () => {
    if (compareResumeIds.length < 2) {
      setError("Choose 2 candidates to compare.");
      return;
    }

    setError(null);

    try {
      const loaded = await Promise.all(compareResumeIds.map((resumeId) => loadQuickView(resumeId)));
      if (loaded.some((item) => !item)) {
        setError("Unable to load one or more candidates for comparison.");
        return;
      }

      setModalResumeIds(compareResumeIds);
      setQuickViewOpen(true);
    } catch {
      setError("Unable to load compare view right now.");
    }
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setModalResumeIds([]);
  };

  const submitAccessRequest = async () => {
    if (!selectedResume) {
      setError("Select a resume before submitting access request.");
      return;
    }

    const result = await createRecruiterAccessRequest({
      resumeId: selectedResume.resumeId,
      companyName: recruiterProfile.companyName,
      companyDomain: recruiterProfile.companyDomain || undefined,
      recruiterName: recruiterProfile.recruiterName,
      recruiterEmail: recruiterProfile.recruiterEmail,
      recruiterRoleTitle: recruiterProfile.recruiterRoleTitle || undefined,
      purpose: recruiterProfile.purpose,
      positionTitle: recruiterProfile.positionTitle || undefined,
      requestedVisibility: recruiterProfile.requestedVisibility,
    });

    if (!result.ok) {
      setError(result.message ?? "Unable to create access request");
      return;
    }

    setMessage("Access request submitted successfully.");
    setError(null);
    setSelectedResumeId(null);
  };

  const modalQuickViews = modalResumeIds
    .map((resumeId) => quickViewsById[resumeId])
    .filter((item): item is RecruiterResumeQuickView => Boolean(item));

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        <p className="subtle">{description}</p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}
      {message ? <article className="card success-text">{message}</article> : null}

      <article className="card stack gap-sm">
        <h3>Filter Criteria</h3>
        
        {/* Job Title Filter */}
        <div>
          <p className="subtle" style={{ marginBottom: "0.5rem" }}>Job Title</p>
          <div className="inline-list" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            {JOB_TITLE_OPTIONS.map((title) => (
              <button
                key={title}
                className={`btn-chip ${searchState.jobTitles.includes(title) ? "active" : ""}`}
                type="button"
                onClick={() =>
                  setSearchState((state) => ({
                    ...state,
                    jobTitles: state.jobTitles.includes(title)
                      ? state.jobTitles.filter((t) => t !== title)
                      : [title], // Only allow one job title
                  }))
                }
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <p className="subtle" style={{ marginBottom: "0.5rem" }}>Skills (select multiple)</p>
          <div className="inline-list" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                className={`btn-chip ${searchState.skills.includes(skill) ? "active" : ""}`}
                type="button"
                onClick={() =>
                  setSearchState((state) => ({
                    ...state,
                    skills: state.skills.includes(skill)
                      ? state.skills.filter((s) => s !== skill)
                      : [...state.skills, skill],
                  }))
                }
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Range Filter */}
        <div>
          <p className="subtle" style={{ marginBottom: "0.5rem" }}>Experience Level</p>
          <div className="inline-list" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            {EXPERIENCE_RANGES.map(({ label, value }) => (
              <button
                key={value}
                className={`btn-chip ${searchState.experienceRange === value ? "active" : ""}`}
                type="button"
                onClick={() =>
                  setSearchState((state) => ({
                    ...state,
                    experienceRange: state.experienceRange === value ? "" : value,
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility Filter */}
        <div>
          <p className="subtle" style={{ marginBottom: "0.5rem" }}>Visibility</p>
          <div className="inline-list" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            {VISIBILITY_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                className={`btn-chip ${searchState.visibility === value ? "active" : ""}`}
                type="button"
                onClick={() =>
                  setSearchState((state) => ({
                    ...state,
                    visibility: state.visibility === value ? "" : value,
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className="inline-list">
          <button className="btn-primary" type="button" onClick={() => void runSearch()}>
            Search Resumes
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setSearchState(initialSearch)}
            style={{ opacity: 0.7 }}
          >
            Clear Filters
          </button>
        </div>
      </article>

      <article className="card stack gap-sm">
        <h3>Search Results</h3>
        <div className="inline-list">
          <p className="subtle">Compare selected: {compareResumeIds.length}/2</p>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => void openCompareQuickView()}
            disabled={compareResumeIds.length < 2}
          >
            Compare 2 Candidates
          </button>
          <button className="btn-secondary" type="button" onClick={() => setCompareResumeIds([])} disabled={compareResumeIds.length === 0}>
            Clear Compare
          </button>
        </div>
        {resumes.length === 0 ? (
          <div className="empty-state">
            <p className="subtle">No results yet. Try a broader filter or press Search to load all public resumes.</p>
          </div>
        ) : null}
        {resumes.map((resume) => (
          <button
            key={resume.resumeId}
            className="card stack gap-sm resume-card-clickable"
            type="button"
            onClick={() => void openSingleQuickView(resume.resumeId)}
          >
            <div className="inline-list">
              <h4>{resume.versionName}</h4>
              <span className={`status-badge ${resume.visibility === "public" ? "info" : "neutral"}`}>{resume.visibility}</span>
              <span className={`status-badge ${resume.status === "Published" ? "approved" : "pending"}`}>{resume.status}</span>
            </div>
            <p className="subtle">
              {resume.ownerName}
              {resume.ownerGithubLogin ? ` (@${resume.ownerGithubLogin})` : ""}
            </p>
            <p className="subtle">
              {resume.targetJobTitle ?? "No target role"} · {resume.targetCompany ?? "No target company"} · {resume.experienceYears.toFixed(1)} yrs exp
            </p>
            <div className="progress-meter" aria-label="Baseline readiness">
              <div className="progress-fill" style={{ width: `${resume.baselineProgress}%` }} />
            </div>
            <p className="subtle">Baseline readiness: {resume.baselineProgress}%</p>
            <div className="inline-list">
              {resume.skillNames.map((skillName) => (
                <span key={`${resume.resumeId}-${skillName}`} className="chip">
                  {skillName}
                </span>
              ))}
            </div>
            <div className="inline-list">
              <button
                className="btn-secondary"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleCompareCandidate(resume.resumeId);
                }}
              >
                {compareResumeIds.includes(resume.resumeId) ? "Remove Compare" : "Add To Compare"}
              </button>
            </div>
            <button
              className="btn-secondary"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedResumeId(resume.resumeId);
              }}
            >
              Request Access
            </button>
          </button>
        ))}
      </article>

      {selectedResume ? (
        <article className="card stack gap-sm">
          <h3>Access Request for {selectedResume.versionName}</h3>
          <input
            className="input"
            placeholder="Company Name"
            value={recruiterProfile.companyName}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, companyName: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Company Domain (optional)"
            value={recruiterProfile.companyDomain}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, companyDomain: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Recruiter Name"
            value={recruiterProfile.recruiterName}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, recruiterName: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Recruiter Email"
            value={recruiterProfile.recruiterEmail}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, recruiterEmail: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Role Title"
            value={recruiterProfile.recruiterRoleTitle}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, recruiterRoleTitle: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Position Title"
            value={recruiterProfile.positionTitle}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, positionTitle: event.target.value }))}
          />
          <textarea
            className="input"
            rows={4}
            placeholder="Access purpose"
            value={recruiterProfile.purpose}
            onChange={(event) => setRecruiterProfile((state) => ({ ...state, purpose: event.target.value }))}
          />
          <select
            className="input"
            value={recruiterProfile.requestedVisibility}
            onChange={(event) =>
              setRecruiterProfile((state) => ({
                ...state,
                requestedVisibility: event.target.value as RecruiterProfile["requestedVisibility"],
              }))
            }
          >
            <option value="read-only">Read-only</option>
            <option value="export">Read + Export</option>
          </select>
          <div className="inline-list">
            <button className="btn-primary" type="button" onClick={() => void submitAccessRequest()}>
              Submit Request
            </button>
            <button className="btn-secondary" type="button" onClick={() => setSelectedResumeId(null)}>
              Cancel
            </button>
          </div>
        </article>
      ) : null}

      {quickViewOpen ? (
        <button className="modal-backdrop" type="button" onClick={closeQuickView} aria-label="Close quick view modal" />
      ) : null}

      <dialog className={`resume-modal ${quickViewOpen ? "open" : ""}`} open={quickViewOpen}>
        <div className="resume-modal-header">
          <h3>{modalQuickViews.length > 1 ? "Candidate Comparison" : "Resume Quick View"}</h3>
          <button className="btn-secondary" type="button" onClick={closeQuickView}>
            Close
          </button>
        </div>
        {modalQuickViews.length > 0 ? (
          <div className={`compare-grid ${modalQuickViews.length > 1 ? "two" : "one"}`}>
            {modalQuickViews.map((candidate, index) => (
              <article key={candidate.resumeId} className="modal-candidate stack gap-sm">
                <p className="eyebrow">{modalQuickViews.length > 1 ? `Candidate ${index + 1}` : "Candidate"}</p>
                <div className="inline-list">
                  <h4>{candidate.versionName}</h4>
                  <span className={`status-badge ${candidate.visibility === "public" ? "info" : "neutral"}`}>{candidate.visibility}</span>
                </div>
                <p className="subtle">Owner: {candidate.ownerName}</p>
                <p className="subtle">
                  {candidate.targetJobTitle ?? "No target role"} · {candidate.targetCompany ?? "No target company"}
                </p>
                {candidate.baseline ? (
                  <article className="card stack gap-sm">
                    <h4>Baseline</h4>
                    <p>{candidate.baseline.fullName}</p>
                    <p className="subtle">{candidate.baseline.headline ?? "No headline"}</p>
                    <p className="subtle">{candidate.baseline.location ?? "No location"}</p>
                    <p className="subtle">{candidate.baseline.summary ?? "No summary"}</p>
                  </article>
                ) : null}
                <article className="card stack gap-sm">
                  <h4>Skills</h4>
                  <div className="inline-list">
                    {candidate.skills.map((skill) => (
                      <span key={`${candidate.resumeId}-${skill.name}`} className="chip">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="card stack gap-sm">
                  <h4>Projects</h4>
                  {candidate.projects.map((project) => (
                    <div key={`${candidate.resumeId}-${project.title}`}>
                      <p>{project.title}</p>
                      <p className="subtle">{project.status}</p>
                    </div>
                  ))}
                </article>
                <article className="card stack gap-sm">
                  <h4>Experiences</h4>
                  {candidate.experiences.map((experience) => (
                    <div key={`${candidate.resumeId}-${experience.role}-${experience.organization}`}>
                      <p>
                        {experience.role} @ {experience.organization}
                      </p>
                      <p className="subtle">{experience.achievement ?? "No achievement detail"}</p>
                    </div>
                  ))}
                </article>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="subtle">Select a resume card to preview owner-approved public/company-only details.</p>
          </div>
        )}
      </dialog>
    </section>
  );
}
