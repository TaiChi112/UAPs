import type { ChangeEvent, MouseEvent } from "react";

import { LayoutDashboard } from "lucide-react";

import type {
  FeatureResumeStatus,
  ResumeId,
  SavedResume,
  VaultData,
} from "@uaps/shared/resume-builder";

import { ToastBanner } from "../shared/toast-banner";
import { CreateResumeOptions } from "./create-resume-options";
import { ResumePreviewModal } from "./resume-preview-modal";
import { SavedResumesGrid } from "./saved-resumes-grid";

export interface DashboardViewProps {
  toastMessage: string | null;
  resumes: SavedResume[];
  db: VaultData;
  previewResume: SavedResume | null;
  statusColors: Record<FeatureResumeStatus, string>;
  onCreateManual: () => void;
  onCreateAi: () => void;
  onOpenPreview: (resume: SavedResume) => void;
  onClosePreview: () => void;
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
  onDownloadPdf: () => void;
}

export function DashboardView({
  toastMessage,
  resumes,
  db,
  previewResume,
  statusColors,
  onCreateManual,
  onCreateAi,
  onOpenPreview,
  onClosePreview,
  onStatusChange,
  onEdit,
  onDuplicate,
  onDelete,
  onDownloadPdf,
}: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans relative">
      {toastMessage && <ToastBanner message={toastMessage} />}

      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 mb-6">
            <LayoutDashboard className="w-8 h-8 text-blue-600" /> My Vault &
            Resumes
          </h1>

          <CreateResumeOptions
            onCreateManual={onCreateManual}
            onCreateAi={onCreateAi}
          />
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
          Saved Resumes
        </h2>
        <SavedResumesGrid
          resumes={resumes}
          statusColors={statusColors}
          onOpenPreview={onOpenPreview}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>

      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          db={db}
          onClose={onClosePreview}
          onEdit={onEdit}
          onDownloadPdf={onDownloadPdf}
        />
      )}
    </div>
  );
}
