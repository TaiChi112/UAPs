import { useState, type FormEvent } from "react";

import { Check, Code, Pencil, Trash2, X } from "lucide-react";

import type { ResumeConfig, SkillId, VaultData } from "@uaps/shared/resume-builder";
import { useResumeBuilderActions } from "../../state/use-resume-builder-actions";

export interface SkillsSectionProps {
  skills: VaultData["skills"];
  selectedSkillIds: ResumeConfig["selectedSkills"];
  newSkill: string;
  onToggleSkill: (skillId: SkillId) => void;
  onNewSkillChange: (value: string) => void;
  onAddSkill: (event: FormEvent<HTMLFormElement>) => void;
}

export function SkillsSection({
  skills,
  selectedSkillIds,
  newSkill,
  onToggleSkill,
  onNewSkillChange,
  onAddSkill,
}: SkillsSectionProps) {
  const actions = useResumeBuilderActions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<SkillId | null>(null);
  const [editSkillName, setEditSkillName] = useState("");
  
  const INITIAL_LIMIT = 15;
  const visibleSkills = isExpanded ? skills : skills.slice(0, INITIAL_LIMIT);
  const hiddenCount = skills.length - visibleSkills.length;

  const handleEditClick = (e: React.MouseEvent, skill: VaultData["skills"][0]) => {
    e.stopPropagation();
    setEditingSkillId(skill.id);
    setEditSkillName(skill.name);
  };

  const handleDeleteClick = async (e: React.MouseEvent, skillId: SkillId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this skill?")) {
      await actions.deleteSkillFromVault(skillId);
    }
  };

  const handleUpdateSkill = async (e: FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingSkillId && editSkillName.trim()) {
      await actions.updateSkillInVault(editingSkillId, editSkillName);
      setEditingSkillId(null);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <Code className="w-4 h-4" /> Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map((skill) => {
          const isSelected = selectedSkillIds.includes(skill.id);

          if (editingSkillId === skill.id) {
            return (
              <form 
                key={skill.id} 
                onSubmit={handleUpdateSkill}
                className="flex items-center gap-1 bg-white border border-blue-400 rounded-full pl-2 pr-1 py-1"
              >
                <input
                  type="text"
                  autoFocus
                  className="text-xs outline-none w-24 bg-transparent"
                  value={editSkillName}
                  onChange={(e) => setEditSkillName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSkillId(null);
                  }}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            );
          }

          return (
            <div
              key={skill.id}
              onClick={() => onToggleSkill(skill.id)}
              className={`group text-xs pl-3 pr-2 py-1.5 rounded-full border transition-colors flex items-center gap-1 cursor-pointer ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
            >
              {isSelected && <Check className="w-3 h-3" />} 
              <span>{skill.name}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleEditClick(e, skill)}
                  className={`p-0.5 rounded ${isSelected ? "text-blue-200 hover:text-white hover:bg-blue-500" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, skill.id)}
                  className={`p-0.5 rounded ${isSelected ? "text-blue-200 hover:text-red-200 hover:bg-blue-500" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
        
        {hiddenCount > 0 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs px-3 py-1.5 rounded-full border bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 transition-colors"
          >
            ... +{hiddenCount} more
          </button>
        )}
        
        {isExpanded && skills.length > INITIAL_LIMIT && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs px-3 py-1.5 rounded-full border bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 transition-colors"
          >
            Show less
          </button>
        )}
      </div>
      <form onSubmit={onAddSkill} className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Quick add new skill..."
          className="flex-1 text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
          value={newSkill}
          onChange={(event) => onNewSkillChange(event.target.value)}
        />
        <button
          type="submit"
          className="bg-slate-800 text-white px-3 rounded-md text-sm hover:bg-slate-700"
        >
          Add
        </button>
      </form>
    </section>
  );
}
