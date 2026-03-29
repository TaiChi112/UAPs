"use client";

import { useEffect, useState } from "react";
import { createResume, deleteResumeById, getResumeBaseline, getResumes, Resume, updateResumeById } from "@/lib/api";

type ResumeFormState = {
  versionName: string;
  targetJobTitle: string;
  targetCompany: string;
  visibility: Resume["visibility"];
  status: Resume["status"];
  isActive: boolean;
};

const emptyForm: ResumeFormState = {
  versionName: "",
  targetJobTitle: "",
  targetCompany: "",
  visibility: "private",
  status: "Draft",
  isActive: false,
};

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [baselineIndicator, setBaselineIndicator] = useState<Record<string, { complete: boolean; reason?: string }>>({});
  const [createForm, setCreateForm] = useState<ResumeFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ResumeFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const list = await getResumes();
      setResumes(list);

      const indicators = await Promise.all(
        list.map(async (resume) => {
          const baseline = await getResumeBaseline(resume.resumeId);
          if (!baseline) {
            return [resume.resumeId, { complete: false, reason: "Missing baseline profile" }] as const;
          }

          const hasName = Boolean(baseline.fullName?.trim());
          const hasContact = Boolean(
            baseline.email?.trim() || baseline.phone?.trim() || baseline.linkedinUrl?.trim() || baseline.githubUrl?.trim(),
          );

          if (!hasName) {
            return [resume.resumeId, { complete: false, reason: "Missing full name" }] as const;
          }

          if (!hasContact) {
            return [resume.resumeId, { complete: false, reason: "Missing contact" }] as const;
          }

          return [resume.resumeId, { complete: true }] as const;
        }),
      );

      setBaselineIndicator(Object.fromEntries(indicators));
    } catch {
      setError("Failed to load resumes.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate: React.ComponentProps<"form">["onSubmit"] = (event) => {
    if (!event) {
      return;
    }

    event.preventDefault();
    void (async () => {
      const result = await createResume(createForm);
      if (!result.ok) {
        setError(result.message ?? "Unable to create resume");
        return;
      }

      setCreateForm(emptyForm);
      await load();
    })();
  };

  const beginEdit = (resume: Resume) => {
    setEditingId(resume.resumeId);
    setEditForm({
      versionName: resume.versionName,
      targetJobTitle: resume.targetJobTitle ?? "",
      targetCompany: resume.targetCompany ?? "",
      visibility: resume.visibility,
      status: resume.status,
      isActive: resume.isActive,
    });
  };

  const handleSave = async (resumeId: string) => {
    const result = await updateResumeById(resumeId, editForm);
    if (!result.ok) {
      setError(result.message ?? "Unable to update resume");
      return;
    }

    setEditingId(null);
    await load();
  };

  const handleDelete = async (resumeId: string) => {
    const result = await deleteResumeById(resumeId);
    if (!result.ok) {
      setError(result.message ?? "Unable to delete resume");
      return;
    }

    await load();
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Resume</p>
        <h2 className="section-title">Resume CRUD</h2>
        <p className="subtle">Manage multiple versions and activate one profile at a time.</p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}

      <form className="card stack gap-sm" onSubmit={handleCreate}>
        <h3>Create Resume</h3>
        <input
          className="input"
          placeholder="Version Name"
          value={createForm.versionName}
          onChange={(event) => setCreateForm((state) => ({ ...state, versionName: event.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Target Job Title"
          value={createForm.targetJobTitle}
          onChange={(event) => setCreateForm((state) => ({ ...state, targetJobTitle: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Target Company"
          value={createForm.targetCompany}
          onChange={(event) => setCreateForm((state) => ({ ...state, targetCompany: event.target.value }))}
        />
        <div className="inline-list">
          <select
            className="input"
            value={createForm.visibility}
            onChange={(event) =>
              setCreateForm((state) => ({ ...state, visibility: event.target.value as Resume["visibility"] }))
            }
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="company-only">Company Only</option>
          </select>
          <select
            className="input"
            value={createForm.status}
            onChange={(event) => setCreateForm((state) => ({ ...state, status: event.target.value as Resume["status"] }))}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
          <label className="inline-list subtle">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(event) => setCreateForm((state) => ({ ...state, isActive: event.target.checked }))}
            />
            <span>Set active</span>
          </label>
        </div>
        <button className="btn-primary" type="submit">
          Create
        </button>
      </form>

      <article className="card stack gap-sm">
        <h3>Resume List</h3>
        {resumes.length === 0 ? <p>No resumes yet.</p> : null}
        {resumes.map((resume) => (
          <div key={resume.resumeId} className="card stack gap-sm">
            {editingId === resume.resumeId ? (
              <>
                <input
                  className="input"
                  value={editForm.versionName}
                  onChange={(event) => setEditForm((state) => ({ ...state, versionName: event.target.value }))}
                />
                <input
                  className="input"
                  value={editForm.targetJobTitle}
                  onChange={(event) => setEditForm((state) => ({ ...state, targetJobTitle: event.target.value }))}
                />
                <input
                  className="input"
                  value={editForm.targetCompany}
                  onChange={(event) => setEditForm((state) => ({ ...state, targetCompany: event.target.value }))}
                />
                <select
                  className="input"
                  value={editForm.visibility}
                  onChange={(event) => setEditForm((state) => ({ ...state, visibility: event.target.value as Resume["visibility"] }))}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="company-only">Company Only</option>
                </select>
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(event) => setEditForm((state) => ({ ...state, status: event.target.value as Resume["status"] }))}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                <label className="inline-list subtle">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(event) => setEditForm((state) => ({ ...state, isActive: event.target.checked }))}
                  />
                  <span>Active</span>
                </label>
                <div className="inline-list">
                  <button className="btn-primary" type="button" onClick={() => void handleSave(resume.resumeId)}>
                    Save
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-list">
                  <h4>{resume.versionName}</h4>
                  <span className="chip">{resume.status}</span>
                  <span className="chip">{resume.visibility}</span>
                  <span className="chip">{resume.isActive ? "Active" : "Inactive"}</span>
                  <span className={`status-badge ${baselineIndicator[resume.resumeId]?.complete ? "approved" : "pending"}`}>
                    {baselineIndicator[resume.resumeId]?.complete ? "Baseline complete" : "Baseline incomplete"}
                  </span>
                </div>
                <p className="subtle">
                  {resume.targetJobTitle ?? "No target role"} · {resume.targetCompany ?? "No target company"}
                </p>
                {baselineIndicator[resume.resumeId]?.complete ? null : (
                  <p className="subtle">{baselineIndicator[resume.resumeId]?.reason ?? "Update baseline profile"}</p>
                )}
                <div className="inline-list">
                  <button className="btn-secondary" type="button" onClick={() => beginEdit(resume)}>
                    Edit
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => void handleDelete(resume.resumeId)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </article>
    </section>
  );
}
