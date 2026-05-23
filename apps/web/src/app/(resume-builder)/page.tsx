"use client";

import { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";

import { useRouter } from "next/navigation";

import type {
  FeatureResumeStatus,
  ResumeId,
  SavedResume,
} from "@uaps/shared/resume-builder";

import { DashboardView } from "@/features/resume-builder/components/dashboard/dashboard-view";
import { useResumeBuilder } from "@/features/resume-builder/state/use-resume-builder";
import { useResumeBuilderActions } from "@/features/resume-builder/state/use-resume-builder-actions";

const statusColors: Record<FeatureResumeStatus, string> = {
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Applied: "bg-blue-50 text-blue-700 border-blue-200",
  Interviewing: "bg-purple-50 text-purple-700 border-purple-200",
};

const formatResumeDate = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ResumeBuilderDashboardPage() {
  const router = useRouter();
  const { state, dispatch } = useResumeBuilder();
  const actions = useResumeBuilderActions();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const previewResume =
    state.ui.previewModal.kind === "open" ? state.ui.previewModal.resume : null;

  const handleCreateManual = () => {
    dispatch({ type: "editor/startManualCreate" });
    router.push("/resume/manual");
  };

  const handleCreateAi = () => {
    dispatch({ type: "editor/startManualCreate" });
    dispatch({ type: "ai/reset" });
    router.push("/resume/ai");
  };

  const handleEdit = (resume: SavedResume) => {
    dispatch({
      type: "editor/loadResumeForEdit",
      payload: { resumeId: resume.id },
    });
    router.push(`/resume/manual/${resume.id}`);
  };

  const handleDuplicate = async (
    resume: SavedResume,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    const duplicatedResume = await actions.duplicateResume(
      resume.id,
      formatResumeDate(),
    );

    if (!duplicatedResume) {
      return;
    }

    dispatch({
      type: "ui/showToast",
      payload: { message: "Resume duplicated!" },
    });
  };

  const handleDelete = async (
    resumeId: ResumeId,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    const deleted = await actions.deleteResume(resumeId);

    if (!deleted) {
      return;
    }

    dispatch({
      type: "ui/showToast",
      payload: { message: "Resume deleted." },
    });
  };

  const handleStatusChange = async (
    resumeId: ResumeId,
    nextStatus: FeatureResumeStatus,
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    event.stopPropagation();
    await actions.updateResumeStatus(resumeId, nextStatus);
  };

  const handleDownloadPdf = async () => {
    if (!previewResume || isDownloadingPdf) {
      return;
    }

    dispatch({
      type: "ui/showToast",
      payload: { message: "Downloading PDF..." },
    });
    setIsDownloadingPdf(true);

    try {
      await actions.downloadResumePdf(previewResume.id);
      dispatch({
        type: "ui/showToast",
        payload: { message: "PDF downloaded." },
      });
    } catch (error) {
      dispatch({
        type: "ui/showToast",
        payload: {
          message:
            error instanceof Error
              ? error.message
              : "Unable to download the resume PDF.",
        },
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <DashboardView
      toastMessage={state.ui.toastMessage}
      resumes={state.savedResumes}
      db={state.db}
      previewResume={previewResume}
      isDownloadingPdf={isDownloadingPdf}
      statusColors={statusColors}
      onCreateManual={handleCreateManual}
      onCreateAi={handleCreateAi}
      onOpenPreview={(resume) =>
        dispatch({ type: "ui/openPreview", payload: { resume } })
      }
      onClosePreview={() => dispatch({ type: "ui/closePreview" })}
      onStatusChange={handleStatusChange}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onDownloadPdf={handleDownloadPdf}
    />
  );
}
