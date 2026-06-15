import { type FormEvent, useState } from "react";

import { Check, Award, Plus, X, Pencil, Trash2 } from "lucide-react";

import type {
  NewAwardDraft,
  AwardId,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";
import { useResumeBuilderActions } from "../../state/use-resume-builder-actions";

export interface AwardsSectionProps {
  awards: VaultData["awards"];
  selectedAwardIds: ResumeConfig["selectedAwards"];
  showAwardForm: boolean;
  newAward: NewAwardDraft;
  onToggleAward: (awardId: AwardId) => void;
  onShowAwardForm: () => void;
  onHideAwardForm: () => void;
  onAwardDraftChange: (draft: NewAwardDraft) => void;
  onAddAward: (event: FormEvent<HTMLFormElement>) => void;
}

export function AwardsSection({
  awards,
  selectedAwardIds,
  showAwardForm,
  newAward,
  onToggleAward,
  onShowAwardForm,
  onHideAwardForm,
  onAwardDraftChange,
  onAddAward,
}: AwardsSectionProps) {
  const actions = useResumeBuilderActions();
  const [editingAwardId, setEditingAwardId] = useState<AwardId | null>(null);
  const [editDraft, setEditDraft] = useState<NewAwardDraft>({
    name: "",
    desc: "",
  });

  const handleEditClick = (e: React.MouseEvent, award: VaultData["awards"][0]) => {
    e.stopPropagation();
    setEditingAwardId(award.id);
    setEditDraft({
      name: award.name,
      desc: award.desc || "",
    });
  };

  const handleDeleteClick = async (e: React.MouseEvent, awardId: AwardId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this award?")) {
      await actions.deleteAwardFromVault(awardId);
    }
  };

  const handleUpdateAward = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingAwardId) {
      await actions.updateAwardInVault(editingAwardId, editDraft);
      setEditingAwardId(null);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <Award className="w-4 h-4" /> Awards
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {awards.map((award) => {
          const isSelected = selectedAwardIds.includes(award.id);

          if (editingAwardId === award.id) {
            return (
              <form
                key={award.id}
                onSubmit={handleUpdateAward}
                className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => setEditingAwardId(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Award Name"
                  required
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.name}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <textarea
                  placeholder="Description"
                  required
                  rows={3}
                  className="w-full text-sm p-2 border rounded-md resize-none"
                  value={editDraft.desc}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, desc: e.target.value }))
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
              key={award.id}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
              onClick={() => onToggleAward(award.id)}
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
                    {award.name}
                  </h4>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, award)}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Edit award"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, award.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete award"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {showAwardForm ? (
          <form
            onSubmit={onAddAward}
            className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
          >
            <button
              type="button"
              onClick={onHideAwardForm}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Award Name"
              required
              className="w-full text-sm p-2 border rounded-md"
              value={newAward.name}
              onChange={(e) =>
                onAwardDraftChange({ ...newAward, name: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              required
              rows={3}
              className="w-full text-sm p-2 border rounded-md resize-none"
              value={newAward.desc}
              onChange={(e) =>
                onAwardDraftChange({ ...newAward, desc: e.target.value })
              }
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Award
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={onShowAwardForm}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-2 border-dashed border-slate-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Award
          </button>
        )}
      </div>
    </section>
  );
}
