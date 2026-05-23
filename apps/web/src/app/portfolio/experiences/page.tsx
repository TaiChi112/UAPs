"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createExperience,
  deleteExperienceById,
  Experience,
  getExperiences,
  getSkills,
  Skill,
  updateExperienceById,
} from "@/lib/api";

type ExperienceFormState = {
  organization: string;
  role: string;
  description: string;
  achievement: string;
  startDate: string;
  endDate: string;
  skillIds: string[];
};

const emptyForm: ExperienceFormState = {
  organization: "",
  role: "",
  description: "",
  achievement: "",
  startDate: "",
  endDate: "",
  skillIds: [],
};

export default function ExperiencePortfolioPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [createForm, setCreateForm] = useState<ExperienceFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ExperienceFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const skillMap = useMemo(
    () => new Map(skills.map((skill) => [skill.skillId, skill.name])),
    [skills],
  );

  const load = async () => {
    setError(null);

    try {
      const [experienceData, skillData] = await Promise.all([
        getExperiences(),
        getSkills(),
      ]);
      setExperiences(experienceData);
      setSkills(skillData);
    } catch {
      setError("Failed to load experiences.");
    }
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  const toggleSkill = (target: "create" | "edit", skillId: string) => {
    const updater = (state: ExperienceFormState) => ({
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
    const result = await createExperience(createForm);
    if (!result.ok) {
      setError(result.message ?? "Unable to create experience");
      return;
    }

    setCreateForm(emptyForm);
    await load();
  };

  const beginEdit = (experience: Experience) => {
    setEditingId(experience.experienceId);
    setEditForm({
      organization: experience.organization,
      role: experience.role,
      description: experience.description ?? "",
      achievement: experience.achievement ?? "",
      startDate: experience.startDate ?? "",
      endDate: experience.endDate ?? "",
      skillIds: experience.skillIds,
    });
  };

  const handleSave = async (experienceId: string) => {
    const result = await updateExperienceById(experienceId, editForm);
    if (!result.ok) {
      setError(result.message ?? "Unable to update experience");
      return;
    }

    setEditingId(null);
    await load();
  };

  const handleDelete = async (experienceId: string) => {
    const result = await deleteExperienceById(experienceId);
    if (!result.ok) {
      setError(result.message ?? "Unable to delete experience");
      return;
    }

    await load();
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Portfolio</p>
        <h2 className="section-title">Experiences CRUD</h2>
        <p className="subtle">
          Track experience entries and map relevant skills.
        </p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}

      <form className="card stack gap-sm" onSubmit={handleCreate}>
        <h3>Create Experience</h3>
        <input
          className="input"
          placeholder="Organization"
          value={createForm.organization}
          onChange={(event) =>
            setCreateForm((state) => ({
              ...state,
              organization: event.target.value,
            }))
          }
          required
        />
        <input
          className="input"
          placeholder="Role"
          value={createForm.role}
          onChange={(event) =>
            setCreateForm((state) => ({ ...state, role: event.target.value }))
          }
          required
        />
        <textarea
          className="textarea"
          placeholder="Description"
          value={createForm.description}
          onChange={(event) =>
            setCreateForm((state) => ({
              ...state,
              description: event.target.value,
            }))
          }
        />
        <textarea
          className="textarea"
          placeholder="Achievement"
          value={createForm.achievement}
          onChange={(event) =>
            setCreateForm((state) => ({
              ...state,
              achievement: event.target.value,
            }))
          }
        />
        <div className="inline-list">
          <input
            className="input"
            type="date"
            value={createForm.startDate}
            onChange={(event) =>
              setCreateForm((state) => ({
                ...state,
                startDate: event.target.value,
              }))
            }
          />
          <input
            className="input"
            type="date"
            value={createForm.endDate}
            onChange={(event) =>
              setCreateForm((state) => ({
                ...state,
                endDate: event.target.value,
              }))
            }
          />
        </div>

        <div className="chip-grid">
          {skills.map((skill) => (
            <label key={skill.skillId} className="chip-select">
              <input
                type="checkbox"
                checked={createForm.skillIds.includes(skill.skillId)}
                onChange={() => toggleSkill("create", skill.skillId)}
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
        <h3>Experience List</h3>
        {experiences.length === 0 ? <p>No experiences yet.</p> : null}
        {experiences.map((experience) => (
          <div key={experience.experienceId} className="card stack gap-sm">
            {editingId === experience.experienceId ? (
              <>
                <input
                  className="input"
                  value={editForm.organization}
                  onChange={(event) =>
                    setEditForm((state) => ({
                      ...state,
                      organization: event.target.value,
                    }))
                  }
                />
                <input
                  className="input"
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((state) => ({
                      ...state,
                      role: event.target.value,
                    }))
                  }
                />
                <textarea
                  className="textarea"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((state) => ({
                      ...state,
                      description: event.target.value,
                    }))
                  }
                />
                <textarea
                  className="textarea"
                  value={editForm.achievement}
                  onChange={(event) =>
                    setEditForm((state) => ({
                      ...state,
                      achievement: event.target.value,
                    }))
                  }
                />
                <div className="inline-list">
                  <input
                    className="input"
                    type="date"
                    value={editForm.startDate}
                    onChange={(event) =>
                      setEditForm((state) => ({
                        ...state,
                        startDate: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="input"
                    type="date"
                    value={editForm.endDate}
                    onChange={(event) =>
                      setEditForm((state) => ({
                        ...state,
                        endDate: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="chip-grid">
                  {skills.map((skill) => (
                    <label key={skill.skillId} className="chip-select">
                      <input
                        type="checkbox"
                        checked={editForm.skillIds.includes(skill.skillId)}
                        onChange={() => toggleSkill("edit", skill.skillId)}
                      />
                      {skill.name}
                    </label>
                  ))}
                </div>
                <div className="inline-list">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => void handleSave(experience.experienceId)}
                  >
                    Save
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4>{experience.role}</h4>
                <p>{experience.organization}</p>
                <p className="subtle">
                  {experience.description ?? "No description"}
                </p>
                <p className="subtle">
                  Skills:{" "}
                  {experience.skillIds
                    .map((id) => skillMap.get(id) ?? id)
                    .join(", ") || "-"}
                </p>
                <div className="inline-list">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => beginEdit(experience)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => void handleDelete(experience.experienceId)}
                  >
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
