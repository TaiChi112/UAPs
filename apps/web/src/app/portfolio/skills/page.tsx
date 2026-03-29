"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSkill, deleteSkillById, getSkills, Skill, updateSkillById } from "@/lib/api";

type SkillFormState = {
  name: string;
  category: string;
  proficiencyLevel: Skill["proficiencyLevel"];
};

const emptyForm: SkillFormState = {
  name: "",
  category: "",
  proficiencyLevel: "Intermediate",
};

export default function SkillPortfolioPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [createForm, setCreateForm] = useState<SkillFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SkillFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);

    try {
      setSkills(await getSkills());
    } catch {
      setError("Failed to load skills.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createSkill(createForm);
    if (!result.ok) {
      setError(result.message ?? "Unable to create skill");
      return;
    }

    setCreateForm(emptyForm);
    await load();
  };

  const beginEdit = (skill: Skill) => {
    setEditingId(skill.skillId);
    setEditForm({
      name: skill.name,
      category: skill.category,
      proficiencyLevel: skill.proficiencyLevel,
    });
  };

  const handleSave = async (skillId: string) => {
    const result = await updateSkillById(skillId, editForm);
    if (!result.ok) {
      setError(result.message ?? "Unable to update skill");
      return;
    }

    setEditingId(null);
    await load();
  };

  const handleDelete = async (skillId: string) => {
    const result = await deleteSkillById(skillId);
    if (!result.ok) {
      setError(result.message ?? "Unable to delete skill");
      return;
    }

    await load();
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Portfolio</p>
        <h2 className="section-title">Skills CRUD</h2>
        <p className="subtle">Manage user skills and proficiency levels for project/experience mapping.</p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}

      <form className="card stack gap-sm" onSubmit={handleCreate}>
        <h3>Create Skill</h3>
        <input
          className="input"
          placeholder="Skill name"
          value={createForm.name}
          onChange={(event) => setCreateForm((state) => ({ ...state, name: event.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Category"
          value={createForm.category}
          onChange={(event) => setCreateForm((state) => ({ ...state, category: event.target.value }))}
          required
        />
        <select
          className="input"
          value={createForm.proficiencyLevel}
          onChange={(event) =>
            setCreateForm((state) => ({ ...state, proficiencyLevel: event.target.value as Skill["proficiencyLevel"] }))
          }
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        <button className="btn-primary" type="submit">
          Create
        </button>
      </form>

      <article className="card stack gap-sm">
        <h3>Skill List</h3>
        {skills.length === 0 ? <p>No skills yet.</p> : null}
        {skills.map((skill) => (
          <div key={skill.skillId} className="card stack gap-sm">
            {editingId === skill.skillId ? (
              <>
                <input
                  className="input"
                  value={editForm.name}
                  onChange={(event) => setEditForm((state) => ({ ...state, name: event.target.value }))}
                />
                <input
                  className="input"
                  value={editForm.category}
                  onChange={(event) => setEditForm((state) => ({ ...state, category: event.target.value }))}
                />
                <select
                  className="input"
                  value={editForm.proficiencyLevel}
                  onChange={(event) =>
                    setEditForm((state) => ({ ...state, proficiencyLevel: event.target.value as Skill["proficiencyLevel"] }))
                  }
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <div className="inline-list">
                  <button className="btn-primary" type="button" onClick={() => void handleSave(skill.skillId)}>
                    Save
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4>{skill.name}</h4>
                <p className="subtle">
                  {skill.category} · {skill.proficiencyLevel}
                </p>
                <div className="inline-list">
                  <button className="btn-secondary" type="button" onClick={() => beginEdit(skill)}>
                    Edit
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => void handleDelete(skill.skillId)}>
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
