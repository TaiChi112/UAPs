import { Edit2, FileDown, X } from "lucide-react";

import type { SavedResume, VaultData } from "@uaps/shared/resume-builder";

import { ResumeDocument } from "../preview/resume-document";

export interface ResumePreviewModalProps {
  resume: SavedResume;
  db: VaultData;
  isDownloadingPdf: boolean;
  onClose: () => void;
  onEdit: (resume: SavedResume) => void;
  onDownloadPdf: () => void;
}

export function ResumePreviewModal({
  resume,
  db,
  isDownloadingPdf,
  onClose,
  onEdit,
  onDownloadPdf,
}: ResumePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl h-full flex flex-col bg-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 line-clamp-1">{resume.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500">Preview Mode</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:hidden hover:bg-slate-100 text-slate-500 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => onEdit(resume)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <FileDown className="w-4 h-4" />{" "}
              {isDownloadingPdf ? "Downloading..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="hidden sm:block p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4 md:p-8 flex-1">
          <ResumeDocument config={resume.config} db={db} />
        </div>
      </div>
    </div>
  );
}
