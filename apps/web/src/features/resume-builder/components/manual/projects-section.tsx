import { type FormEvent, useState } from "react";

import { Check, FileText, Plus, X, Pencil, Trash2 } from "lucide-react";

import type {
  NewProjectDraft,
  ProjectId,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";
import { useResumeBuilderActions } from "../../state/use-resume-builder-actions";

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
  const actions = useResumeBuilderActions();
  const [editingProjectId, setEditingProjectId] = useState<ProjectId | null>(null);
  const [editDraft, setEditDraft] = useState<NewProjectDraft>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleEditClick = (e: React.MouseEvent, project: VaultData["projects"][0]) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    const [startDate = "", endDate = ""] = (project.duration || "").split(" - ");
    setEditDraft({
      title: project.title,
      description: project.description || "",
      startDate,
      endDate,
    });
  };

  const handleDeleteClick = async (e: React.MouseEvent, projectId: ProjectId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      await actions.deleteProjectFromVault(projectId);
    }
  };

  const handleUpdateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingProjectId) {
      await actions.updateProjectInVault(editingProjectId, editDraft);
      setEditingProjectId(null);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <FileText className="w-4 h-4" /> Projects
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {projects.map((project) => {
          const isSelected = selectedProjectIds.includes(project.id);

          if (editingProjectId === project.id) {
            return (
              <form
                key={project.id}
                onSubmit={handleUpdateProject}
                className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Project Title"
                  required
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.title}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, title: e.target.value })
                  }
                />
                <input
                  type="url"
                  placeholder="GitHub Repository URL (Optional)"
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.githubUrl || ""}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, githubUrl: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Start Date"
                    className="w-1/2 text-sm p-2 border rounded-md"
                    value={editDraft.startDate || ""}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, startDate: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="End Date"
                    className="w-1/2 text-sm p-2 border rounded-md"
                    value={editDraft.endDate || ""}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, endDate: e.target.value })
                    }
                  />
                </div>
                
                {/* Description handling for editing */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">
                    Project Details (Bullet Points)
                  </label>
                  {(typeof editDraft.description === "string" 
                    ? [editDraft.description] 
                    : Array.isArray(editDraft.description) ? editDraft.description : [])
                    .map((point: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 text-sm p-2 border rounded-md"
                          value={point}
                          onChange={(e) => {
                            const newDesc = Array.isArray(editDraft.description) 
                              ? [...editDraft.description] 
                              : [editDraft.description || ""];
                            newDesc[index] = e.target.value;
                            setEditDraft({ ...editDraft, description: newDesc as any });
                          }}
                        />
                        <button
                          type="button"
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          onClick={() => {
                            const newDesc = Array.isArray(editDraft.description) 
                              ? editDraft.description.filter((_, i) => i !== index)
                              : [];
                            setEditDraft({ ...editDraft, description: newDesc as any });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newDesc = Array.isArray(editDraft.description) 
                        ? [...editDraft.description, ""]
                        : [(editDraft.description || ""), ""];
                      setEditDraft({ ...editDraft, description: newDesc as any });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add bullet point
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Save Changes
                </button>
              </form>
            );
          }

          return (
            <div
              key={project.id}
              onClick={() => onToggleProject(project.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all group ${isSelected ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                    {project.title}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(e, project)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, project.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {project.duration && (
                    <div className="text-xs text-slate-500 mb-1">
                      {project.duration}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {Array.isArray(project.description) ? project.description.join(" • ") : project.description}
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
            type="url"
            placeholder="GitHub Repository URL (Optional)"
            className="w-full text-sm p-2 border rounded-md"
            value={newProject.githubUrl || ""}
            onChange={(event) =>
              onProjectDraftChange({
                ...newProject,
                githubUrl: event.target.value,
              })
            }
          />
          <div className="flex gap-2">
            <input
              type="date"
              placeholder="Start Date"
              className="w-1/2 text-sm p-2 border rounded-md"
              value={newProject.startDate}
              onChange={(event) =>
                onProjectDraftChange({
                  ...newProject,
                  startDate: event.target.value,
                })
              }
            />
            <input
              type="date"
              placeholder="End Date"
              className="w-1/2 text-sm p-2 border rounded-md"
              value={newProject.endDate}
              onChange={(event) =>
                onProjectDraftChange({
                  ...newProject,
                  endDate: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              Project Descriptions / Responsibilities
            </label>
            {newProject.description.split('\n').map((line, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Point ${index + 1}`}
                    required
                    className="w-full text-sm p-2 border rounded-md"
                    value={line}
                    onChange={(event) => {
                      const newLines = newProject.description.split('\n');
                      newLines[index] = event.target.value;
                      onProjectDraftChange({
                        ...newProject,
                        description: newLines.join('\n'),
                      });
                    }}
                  />
                </div>
                {newProject.description.split('\n').length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newLines = newProject.description.split('\n').filter((_, i) => i !== index);
                      onProjectDraftChange({
                        ...newProject,
                        description: newLines.join('\n'),
                      });
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 border rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                onProjectDraftChange({
                  ...newProject,
                  description: newProject.description ? newProject.description + '\n' : '\n',
                });
              }}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              <Plus className="w-3 h-3" /> Add another point
            </button>
          </div>
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
