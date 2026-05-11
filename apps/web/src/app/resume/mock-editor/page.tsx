"use client";

import { useState } from "react";
import { mockSkills, mockProjects, mockResumes, Skill, Project } from "@/lib/mock-items";

export default function MockResumeEditorPage() {
  const [resumes, setResumes] = useState(() => mockResumes.map((r) => ({ ...r })));
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editSkillName, setEditSkillName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) ?? null;

  const addSkillToResume = (skill: Skill) => {
    if (!selectedResume) return;
    setResumes((prev) => {
      const out = [] as typeof prev;
      for (const r of prev) {
        if (r.id === selectedResumeId) {
          const exists = r.skills.some((s) => s.skillId === skill.skillId);
          out.push(exists ? r : { ...r, skills: [...r.skills, skill] });
        } else {
          out.push(r);
        }
      }
      return out;
    });
    setMessage(`Added skill ${skill.name} to ${selectedResume.title}`);
  };

  const addProjectToResume = (project: Project) => {
    if (!selectedResume) return;
    setResumes((prev) => prev.map((r) => (r.id === selectedResumeId ? { ...r, projects: [...r.projects, project] } : r)));
    setMessage(`Added project ${project.title} to ${selectedResume.title}`);
  };

  const beginEditSkill = (skill: Skill) => {
    setEditingSkillId(skill.skillId);
    setEditSkillName(skill.name);
  };

  const cancelEditSkill = () => {
    setEditingSkillId(null);
    setEditSkillName("");
  };

  const saveSkill = (skillId: string) => {
    if (!selectedResume) return;
    const trimmed = editSkillName.trim();
    if (!trimmed) return;
    setResumes((prev) =>
      prev.map((r) =>
        r.id !== selectedResumeId
          ? r
          : {
              ...r,
              skills: r.skills.map((s) => (s.skillId === skillId ? { ...s, name: trimmed } : s)),
            },
      ),
    );
    setMessage("Updated skill name (mock)");
    cancelEditSkill();
  };

  const beginEditProject = (project: Project) => {
    setEditingProjectId(project.projectId);
    setEditProjectTitle(project.title);
    setEditProjectDescription(project.description ?? "");
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setEditProjectTitle("");
    setEditProjectDescription("");
  };

  const saveProject = (projectId: string) => {
    if (!selectedResume) return;
    const nextTitle = editProjectTitle.trim();
    if (!nextTitle) return;

    setResumes((prev) =>
      prev.map((r) =>
        r.id !== selectedResumeId
          ? r
          : {
              ...r,
              projects: r.projects.map((p) =>
                p.projectId === projectId
                  ? {
                      ...p,
                      title: nextTitle,
                      description: editProjectDescription.trim() || undefined,
                    }
                  : p,
              ),
            },
      ),
    );
    setMessage("Updated project title and description (mock)");
    cancelEditProject();
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Resume Editor (Mock)</p>
        <h2 className="section-title">Add Skills & Projects into Resume</h2>
        <p className="subtle">Pick a resume, then click to add mock skills or projects into it (in-memory only).</p>
      </div>

      {message ? <article className="card success-text">{message}</article> : null}

      <article className="card stack gap-sm">
        <h3>Select Resume</h3>
        <select className="input" value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>

        <div className="panel-grid">
          <div className="mini-panel">
            <h4>Available Skills</h4>
            <ul>
              {mockSkills.map((s) => (
                <li key={s.skillId} className="inline-list">
                  <span>{s.name}</span>
                  <button className="btn-chip" type="button" onClick={() => addSkillToResume(s)}>
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mini-panel">
            <h4>Available Projects</h4>
            <ul>
              {mockProjects.map((p) => (
                <li key={p.projectId} className="stack gap-sm">
                  <div className="inline-list">
                    <span>{p.title}</span>
                    <button className="btn-chip" type="button" onClick={() => addProjectToResume(p)}>
                      Add
                    </button>
                  </div>
                  <p className="subtle">{p.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mini-panel">
            <h4>Selected</h4>
            {selectedResume ? (
              <div>
                <p className="eyebrow">Skills</p>
                <ul>
                  {selectedResume.skills.length === 0 ? <li className="subtle">No skills yet</li> : null}
                  {selectedResume.skills.map((s) => (
                    <li key={s.skillId} className="inline-list">
                      {editingSkillId === s.skillId ? (
                        <>
                          <input className="input" value={editSkillName} onChange={(e) => setEditSkillName(e.target.value)} />
                          <button className="btn-chip" type="button" onClick={() => saveSkill(s.skillId)}>
                            Save
                          </button>
                          <button className="btn-chip" type="button" onClick={cancelEditSkill}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{s.name}</span>
                          <button className="btn-chip" type="button" onClick={() => beginEditSkill(s)}>
                            Edit
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                <p className="eyebrow">Projects</p>
                <ul>
                  {selectedResume.projects.length === 0 ? <li className="subtle">No projects yet</li> : null}
                  {selectedResume.projects.map((p) => (
                    <li key={p.projectId} className="stack gap-sm">
                      {editingProjectId === p.projectId ? (
                        <>
                          <input className="input" value={editProjectTitle} onChange={(e) => setEditProjectTitle(e.target.value)} />
                          <textarea
                            className="input"
                            value={editProjectDescription}
                            onChange={(e) => setEditProjectDescription(e.target.value)}
                            rows={3}
                          />
                          <div className="inline-list">
                            <button className="btn-chip" type="button" onClick={() => saveProject(p.projectId)}>
                              Save
                            </button>
                            <button className="btn-chip" type="button" onClick={cancelEditProject}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="inline-list">
                            <span>{p.title}</span>
                            <button className="btn-chip" type="button" onClick={() => beginEditProject(p)}>
                              Edit
                            </button>
                          </div>
                          {p.description ? <p className="subtle">{p.description}</p> : null}
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="action-row">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => setMessage(`Saved mock resume ${selectedResume.title} (in-memory)`) }
                  >
                    Save (mock)
                  </button>
                </div>
              </div>
            ) : (
              <p className="subtle">Select a resume to edit</p>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
