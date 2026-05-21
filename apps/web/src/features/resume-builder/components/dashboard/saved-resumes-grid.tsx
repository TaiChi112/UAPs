import type { ChangeEvent, MouseEvent } from "react";

import type {
  FeatureResumeStatus,
  ResumeId,
  SavedResume,
} from "@uaps/shared/resume-builder";

import { ResumeCard } from "./resume-card";

export interface SavedResumesGridProps {
  resumes: SavedResume[];
  statusColors: Record<FeatureResumeStatus, string>;
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
}

export function SavedResumesGrid({
  resumes,
  statusColors,
  onOpenPreview,
  onStatusChange,
  onEdit,
  onDuplicate,
  onDelete,
}: SavedResumesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          statusClassName={statusColors[resume.status]}
          onOpenPreview={onOpenPreview}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
