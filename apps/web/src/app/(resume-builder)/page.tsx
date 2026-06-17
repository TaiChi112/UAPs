"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { SavedResume } from "@uaps/shared/resume-builder";
import { getResumeBuilderRepository } from "@/features/resume-builder/services/repositories";
import { ResumePreviewModal } from "@/features/resume-builder/components/dashboard/resume-preview-modal";
import { downloadResumeBuilderPdf } from "@/lib/api";
import { useResumeBuilder } from "@/features/resume-builder/state/use-resume-builder";

import { Calendar, Eye, FileText, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// We create a sophisticated card component for public resumes
function PublicResumeCard({
  resume,
  onOpenPreview,
}: {
  resume: SavedResume;
  onOpenPreview: (resume: SavedResume) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col justify-between overflow-hidden cursor-pointer h-full"
      onClick={() => onOpenPreview(resume)}
    >
      <div className="p-6 pb-4 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            {resume.authorAvatarUrl ? (
              <img src={resume.authorAvatarUrl} alt={resume.authorName || "Author"} className="w-5 h-5 rounded-full" />
            ) : (
              <UserIcon className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-600">{resume.authorName || "Anonymous"}</span>
          </div>
        </div>
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {resume.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 line-clamp-2">
          {resume.config.summary || "No summary provided. Click to view full resume details."}
        </p>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
          Role: <span className="text-slate-700">{resume.config.targetRole || "Any"}</span>
        </div>
        <div className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
          <Eye className="w-4 h-4" /> View
        </div>
      </div>
    </div>
  );
}

export default function PublicFeedPage() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState<SavedResume | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { state, dispatch } = useResumeBuilder(); // For db context for preview
  const router = useRouter();

  useEffect(() => {
    const fetchPublicResumes = async () => {
      try {
        const repo = getResumeBuilderRepository();
        const publicResumes = await repo.getPublicResumes();
        setResumes(publicResumes);
      } catch (err) {
        console.error("Failed to load public resumes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicResumes();
  }, []);

  const handleDownloadPdf = async () => {
    if (!previewResume || isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const result = await downloadResumeBuilderPdf(String(previewResume.id));
      if (!result.ok || !result.data) {
        throw new Error(result.message ?? "Failed to download PDF");
      }
      const objectUrl = window.URL.createObjectURL(result.data.blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = result.data.fileName;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download PDF", error);
      alert("Unable to download the resume PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 p-4 md:p-6 font-sans relative min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="mb-2 flex items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
            <Users className="h-7 w-7 text-blue-600" /> Public Resume Feed
          </h1>
          <p className="text-slate-600">
            Explore public resumes created by other users in the community.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium">No public resumes found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <PublicResumeCard
                key={resume.id}
                resume={resume}
                onOpenPreview={setPreviewResume}
              />
            ))}
          </div>
        )}
      </div>

      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          db={previewResume.vaultData || state.db}
          isDownloadingPdf={isDownloadingPdf}
          onClose={() => setPreviewResume(null)}
          onEdit={(resume) => {
            // Check if it's the user's own resume
            const isOwner = state.savedResumes.some((r) => r.id === resume.id);
            if (isOwner) {
              dispatch({
                type: "editor/loadResumeForEdit",
                payload: { resumeId: resume.id },
              });
              router.push(`/resume/manual/${resume.id}`);
            } else {
              alert("You cannot edit a resume that does not belong to you.");
            }
          }}
          onDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
}
