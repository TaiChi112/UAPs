import { type FormEvent, useState, useRef } from "react";

import { Check, Briefcase, Plus, X, Pencil, Trash2 } from "lucide-react";

import type {
  NewExperienceDraft,
  ExperienceId,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";
import { useResumeBuilderActions } from "../../state/use-resume-builder-actions";
import { useClickOutsideWithAutoSave } from "../../../../hooks/use-click-outside-auto-save";

export interface ExperienceSectionProps {
  experience: VaultData["experience"];
  selectedExperienceIds: ResumeConfig["selectedExperience"];
  showExperienceForm: boolean;
  newExperience: NewExperienceDraft;
  onToggleExperience: (experienceId: ExperienceId) => void;
  onShowExperienceForm: () => void;
  onHideExperienceForm: () => void;
  onExperienceDraftChange: (draft: NewExperienceDraft) => void;
  onAddExperience: (event: FormEvent<HTMLFormElement>) => void;
}

export function ExperienceSection({
  experience,
  selectedExperienceIds,
  showExperienceForm,
  newExperience,
  onToggleExperience,
  onShowExperienceForm,
  onHideExperienceForm,
  onExperienceDraftChange,
  onAddExperience,
}: ExperienceSectionProps) {
  const actions = useResumeBuilderActions();
  const [editingExperienceId, setEditingExperienceId] = useState<ExperienceId | null>(null);
  const [editDraft, setEditDraft] = useState<NewExperienceDraft>({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    responsibilities: "",
  });
  const handleAddExperienceInternal = () => {
    onAddExperience({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
  };

  const addFormRef = useRef<HTMLFormElement>(null);
  useClickOutsideWithAutoSave({
    formRef: addFormRef,
    onClose: onHideExperienceForm,
    onSave: handleAddExperienceInternal,
    shouldAutoSave: showExperienceForm && !!newExperience.role.trim(),
  });

  const handleEditClick = (e: React.MouseEvent, exp: VaultData["experience"][0]) => {
    e.stopPropagation();
    setEditingExperienceId(exp.id);
    const [startDate = "", endDate = ""] = (exp.duration || "").split(" - ");
    setEditDraft({
      company: exp.company,
      role: exp.role,
      startDate,
      endDate,
      responsibilities: exp.responsibilities || "",
    });
  };

  const handleDeleteClick = async (e: React.MouseEvent, experienceId: ExperienceId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this experience?")) {
      await actions.deleteExperienceFromVault(experienceId);
    }
  };

  const handleUpdateExperience = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingExperienceId) {
      await actions.updateExperienceInVault(editingExperienceId, editDraft);
      setEditingExperienceId(null);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <Briefcase className="w-4 h-4" /> Experience
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {experience.map((exp) => {
          const isSelected = selectedExperienceIds.includes(exp.id);

          if (editingExperienceId === exp.id) {
            return (
              <form
                key={exp.id}
                onSubmit={handleUpdateExperience}
                className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => setEditingExperienceId(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Role / Title"
                  required
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.role}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, role: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Company"
                  required
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.company}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, company: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Start Date"
                    className="w-1/2 text-sm p-2 border rounded-md"
                    value={editDraft.startDate}
                    onChange={(e) =>
                      setEditDraft((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="End Date"
                    className="w-1/2 text-sm p-2 border rounded-md"
                    value={editDraft.endDate}
                    onChange={(e) =>
                      setEditDraft((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>
                <textarea
                  placeholder="Responsibilities"
                  required
                  rows={3}
                  className="w-full text-sm p-2 border rounded-md resize-none"
                  value={editDraft.responsibilities}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, responsibilities: e.target.value }))
                  }
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            );
          }

          return (
            <div
              key={exp.id}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
              onClick={() => onToggleExperience(exp.id)}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-300 text-transparent"
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`font-medium text-sm truncate ${
                      isSelected ? "text-blue-900" : "text-slate-800"
                    }`}
                  >
                    {exp.role}
                  </h4>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, exp)}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Edit experience"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, exp.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isSelected ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {exp.company}
                </div>
              </div>
            </div>
          );
        })}

        {showExperienceForm ? (
          <form
            ref={addFormRef}
            onSubmit={onAddExperience}
            className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
          >
            <button
              type="button"
              onClick={onHideExperienceForm}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Role / Title"
              required
              className="w-full text-sm p-2 border rounded-md"
              value={newExperience.role}
              onChange={(e) =>
                onExperienceDraftChange({ ...newExperience, role: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Company"
              required
              className="w-full text-sm p-2 border rounded-md"
              value={newExperience.company}
              onChange={(e) =>
                onExperienceDraftChange({ ...newExperience, company: e.target.value })
              }
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Start Date"
                className="w-1/2 text-sm p-2 border rounded-md"
                value={newExperience.startDate}
                onChange={(e) =>
                  onExperienceDraftChange({ ...newExperience, startDate: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="End Date"
                className="w-1/2 text-sm p-2 border rounded-md"
                value={newExperience.endDate}
                onChange={(e) =>
                  onExperienceDraftChange({ ...newExperience, endDate: e.target.value })
                }
              />
            </div>
            <textarea
              placeholder="Responsibilities"
              required
              rows={3}
              className="w-full text-sm p-2 border rounded-md resize-none"
              value={newExperience.responsibilities}
              onChange={(e) =>
                onExperienceDraftChange({
                  ...newExperience,
                  responsibilities: e.target.value,
                })
              }
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Experience
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={onShowExperienceForm}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-2 border-dashed border-slate-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        )}
      </div>
    </section>
  );
}
