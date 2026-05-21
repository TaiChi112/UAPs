import type { FormEvent } from "react";

import { Check, FileText, Plus, X } from "lucide-react";

import type {
  NewProjectDraft,
  ProjectId,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";

export interface ProjectsSectionProps {
  projects: VaultData["projects"];
  selectedProjectIds: ResumeConfig["selectedProjects"];
  showProjectForm: boolean;
  newProject: NewProjectDraft;
  onToggleProject: (projectId: ProjectId) => void;
  onShowProjectForm: () => void;
  onHideProjectForm: () => void;
  onProjectDraftChange: (draft: NewProjectDraft) => void;
  onAddProject: (event: FormEvent<HTMLFormElement>) => void;
}

export function ProjectsSection({
  projects,
  selectedProjectIds,
  showProjectForm,
  newProject,
  onToggleProject,
  onShowProjectForm,
  onHideProjectForm,
  onProjectDraftChange,
  onAddProject,
}: ProjectsSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <FileText className="w-4 h-4" /> Projects
      </h3>
      <div className="space-y-2">
        {projects.map((project) => {
          const isSelected = selectedProjectIds.includes(project.id);

          return (
            <div
              key={project.id}
              onClick={() => onToggleProject(project.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm text-slate-900">
                    {project.title}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {project.description}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showProjectForm ? (
        <form
          onSubmit={onAddProject}
          className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3 relative"
        >
          <button
            type="button"
            onClick={onHideProjectForm}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Project Title"
            required
            className="w-full text-sm p-2 border rounded-md"
            value={newProject.title}
            onChange={(event) =>
              onProjectDraftChange({
                ...newProject,
                title: event.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Your Role"
            required
            className="w-full text-sm p-2 border rounded-md"
            value={newProject.role}
            onChange={(event) =>
              onProjectDraftChange({
                ...newProject,
                role: event.target.value,
              })
            }
          />
          <textarea
            placeholder="Description"
            required
            className="w-full text-sm p-2 border rounded-md h-16"
            value={newProject.description}
            onChange={(event) =>
              onProjectDraftChange({
                ...newProject,
                description: event.target.value,
              })
            }
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Save & Select
          </button>
        </form>
      ) : (
        <button
          onClick={onShowProjectForm}
          className="flex items-center justify-center gap-1 w-full p-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      )}
    </section>
  );
}
