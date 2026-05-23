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
  isDownloadingPdf: boolean;
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
  isDownloadingPdf,
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
    <div className="bg-slate-50 text-slate-800 p-4 md:p-6 font-sans relative">
      {toastMessage && <ToastBanner message={toastMessage} />}

      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="mb-4 flex items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
            <LayoutDashboard className="h-7 w-7 text-blue-600" /> My Vault &
            Resumes
          </h1>

          <CreateResumeOptions
            onCreateManual={onCreateManual}
            onCreateAi={onCreateAi}
          />
        </div>

        <h2 className="mb-4 border-b pb-2 text-lg font-bold text-slate-800">
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
          isDownloadingPdf={isDownloadingPdf}
          onClose={onClosePreview}
          onEdit={onEdit}
          onDownloadPdf={onDownloadPdf}
        />
      )}
    </div>
  );
}
