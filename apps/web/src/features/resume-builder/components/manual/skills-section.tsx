import type { FormEvent } from "react";

import { Check, Code } from "lucide-react";

import type { ResumeConfig, SkillId, VaultData } from "@uaps/shared/resume-builder";

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
  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <Code className="w-4 h-4" /> Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const isSelected = selectedSkillIds.includes(skill.id);

          return (
            <button
              key={skill.id}
              onClick={() => onToggleSkill(skill.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
            >
              {isSelected && <Check className="w-3 h-3" />} {skill.name}
            </button>
          );
        })}
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
