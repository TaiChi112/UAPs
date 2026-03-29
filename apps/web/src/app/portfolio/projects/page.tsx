"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createProject,
  deleteProjectById,
  getProjects,
  getSkills,
  Project,
  Skill,
  updateProjectById,
} from "@/lib/api";

type ProjectFormState = {
  title: string;
  description: string;
  repoURL: string;
  status: Project["status"];
  isActive: boolean;
  skillIds: string[];
};

const emptyForm: ProjectFormState = {
  title: "",
  description: "",
  repoURL: "",
  status: "Completed",
  isActive: true,
  skillIds: [],
};

export default function ProjectPortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [createForm, setCreateForm] = useState<ProjectFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProjectFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const skillMap = useMemo(() => new Map(skills.map((skill) => [skill.skillId, skill.name])), [skills]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [projectData, skillData] = await Promise.all([getProjects(), getSkills()]);
      setProjects(projectData);
      setSkills(skillData);
    } catch {
      setError("Failed to load projects. Ensure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleFormSkill = (target: "create" | "edit", skillId: string) => {
    const updater = (state: ProjectFormState) => ({
      ...state,
      skillIds: state.skillIds.includes(skillId)
        ? state.skillIds.filter((id) => id !== skillId)
        : [...state.skillIds, skillId],
    });

    if (target === "create") {
      setCreateForm((state) => updater(state));
    } else {
      setEditForm((state) => updater(state));
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createProject(createForm);

    if (!result.ok) {
      setError(result.message ?? "Unable to create project");
      return;
    }

    setCreateForm(emptyForm);
    await load();
  };

  const beginEdit = (project: Project) => {
    setEditingId(project.projectId);
    setEditForm({
      title: project.title,
      description: project.description ?? "",
      repoURL: project.repoURL ?? "",
      status: project.status,
      isActive: project.isActive,
      skillIds: project.skillIds,
    });
  };

  const handleSave = async (projectId: string) => {
    const result = await updateProjectById(projectId, editForm);

    if (!result.ok) {
      setError(result.message ?? "Unable to update project");
      return;
    }

    setEditingId(null);
    await load();
  };

  const handleDelete = async (projectId: string) => {
    const result = await deleteProjectById(projectId);

    if (!result.ok) {
      setError(result.message ?? "Unable to delete project");
      return;
    }

    await load();
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Portfolio</p>
        <h2 className="section-title">Projects CRUD</h2>
        <p className="subtle">Create, edit, and delete projects with skill mapping for resume composition.</p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}

      <form className="card stack gap-sm" onSubmit={handleCreate}>
        <h3>Create Project</h3>
        <input
          className="input"
          placeholder="Project title"
          value={createForm.title}
          onChange={(event) => setCreateForm((state) => ({ ...state, title: event.target.value }))}
          required
        />
        <textarea
          className="textarea"
          placeholder="Description"
          value={createForm.description}
          onChange={(event) => setCreateForm((state) => ({ ...state, description: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Repository URL"
          value={createForm.repoURL}
          onChange={(event) => setCreateForm((state) => ({ ...state, repoURL: event.target.value }))}
        />
        <div className="inline-list">
          <select
            className="input"
            value={createForm.status}
            onChange={(event) => setCreateForm((state) => ({ ...state, status: event.target.value as Project["status"] }))}
          >
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
          </select>
          <label className="inline-list subtle">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(event) => setCreateForm((state) => ({ ...state, isActive: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <div className="chip-grid">
          {skills.map((skill) => (
            <label key={skill.skillId} className="chip-select">
              <input
                type="checkbox"
                checked={createForm.skillIds.includes(skill.skillId)}
                onChange={() => toggleFormSkill("create", skill.skillId)}
              />
              {skill.name}
            </label>
          ))}
        </div>

        <button className="btn-primary" type="submit">
          Create
        </button>
      </form>

      <article className="card stack gap-sm">
        <h3>Project List</h3>
        {loading ? <p>Loading...</p> : null}
        {!loading && projects.length === 0 ? <p>No projects yet.</p> : null}
        {projects.map((project) => (
          <div key={project.projectId} className="card stack gap-sm">
            {editingId === project.projectId ? (
              <>
                <input
                  className="input"
                  value={editForm.title}
                  onChange={(event) => setEditForm((state) => ({ ...state, title: event.target.value }))}
                />
                <textarea
                  className="textarea"
                  value={editForm.description}
                  onChange={(event) => setEditForm((state) => ({ ...state, description: event.target.value }))}
                />
                <input
                  className="input"
                  value={editForm.repoURL}
                  onChange={(event) => setEditForm((state) => ({ ...state, repoURL: event.target.value }))}
                />
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((state) => ({ ...state, status: event.target.value as Project["status"] }))
                  }
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                </select>
                <label className="inline-list subtle">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(event) => setEditForm((state) => ({ ...state, isActive: event.target.checked }))}
                  />
                  Active
                </label>
                <div className="chip-grid">
                  {skills.map((skill) => (
                    <label key={skill.skillId} className="chip-select">
                      <input
                        type="checkbox"
                        checked={editForm.skillIds.includes(skill.skillId)}
                        onChange={() => toggleFormSkill("edit", skill.skillId)}
                      />
                      {skill.name}
                    </label>
                  ))}
                </div>
                <div className="inline-list">
                  <button className="btn-primary" type="button" onClick={() => void handleSave(project.projectId)}>
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
                  <h4>{project.title}</h4>
                  <span className="chip">{project.status}</span>
                </div>
                <p className="subtle">{project.description ?? "No description"}</p>
                <p className="subtle">Skills: {project.skillIds.map((id) => skillMap.get(id) ?? id).join(", ") || "-"}</p>
                <div className="inline-list">
                  <button className="btn-secondary" type="button" onClick={() => beginEdit(project)}>
                    Edit
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => void handleDelete(project.projectId)}>
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
