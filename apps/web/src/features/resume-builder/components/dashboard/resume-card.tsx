import type { ChangeEvent, MouseEvent } from "react";

import {
  Calendar,
  Copy,
  Edit2,
  Eye,
  FileText,
  Tag,
  Trash2,
} from "lucide-react";

import type {
  FeatureResumeStatus,
  ResumeId,
  SavedResume,
} from "@uaps/shared/resume-builder";

export interface ResumeCardProps {
  resume: SavedResume;
  statusClassName: string;
  onOpenPreview: (resume: SavedResume) => void;
  onStatusChange: (
    resumeId: ResumeId,
    nextStatus: FeatureResumeStatus,
    event: ChangeEvent<HTMLSelectElement>,
  ) => void;
  onEdit: (resume: SavedResume) => void;
  onDuplicate: (
    resume: SavedResume,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  onDelete: (
    resumeId: ResumeId,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  onVisibilityChange: (
    resumeId: ResumeId,
    visibility: string,
    event: ChangeEvent<HTMLSelectElement>,
  ) => void;
}

export function ResumeCard({
  resume,
  statusClassName,
  onOpenPreview,
  onStatusChange,
  onEdit,
  onDuplicate,
  onDelete,
  onVisibilityChange,
}: ResumeCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden cursor-pointer"
      onClick={() => onOpenPreview(resume)}
    >
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <select
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer pr-6 ${statusClassName}`}
              value={resume.status}
              onChange={(event) =>
                onStatusChange(
                  resume.id,
                  event.target.value as FeatureResumeStatus,
                  event,
                )
              }
            >
              <option value="Draft">Draft</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
            </select>
            <Tag className="w-3 h-3 absolute right-2.5 top-2 opacity-50 pointer-events-none" />
          </div>
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <select
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer pr-6 ${resume.visibility === "public" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
              value={resume.visibility || "private"}
              onChange={(event) =>
                onVisibilityChange(
                  resume.id,
                  event.target.value,
                  event,
                )
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <Tag className="w-3 h-3 absolute right-2.5 top-2 opacity-50 pointer-events-none" />
          </div>
        </div>
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {resume.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4 opacity-70" /> {resume.date}
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/50 p-3 px-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit(resume);
            }}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(event) => onDuplicate(resume, event)}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(event) => onDelete(resume.id, event)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm font-medium text-slate-600 flex items-center gap-1 group-hover:text-blue-600">
          <Eye className="w-4 h-4" /> View
        </div>
      </div>
    </div>
  );
}
