import { FileText } from "lucide-react";

import type {
  AiAnalysisState,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";

import { ResumeDocument } from "../preview/resume-document";

export interface AiPreviewPanelProps {
  aiAnalysisState: AiAnalysisState;
  db: VaultData;
  emptyConfig: ResumeConfig;
  resumeConfig: ResumeConfig;
}

export function AiPreviewPanel({
  aiAnalysisState,
  db,
  emptyConfig,
  resumeConfig,
}: AiPreviewPanelProps) {
  return (
    <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl border-slate-200 border p-2 overflow-y-auto flex justify-center items-start">
      {aiAnalysisState === "idle" ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 w-full min-h-[400px]">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium text-slate-500">
            Awaiting AI Analysis...
          </p>
          <p className="text-sm text-slate-400">
            Paste JD and click analyze to see your tailored resume.
          </p>
        </div>
      ) : aiAnalysisState === "analyzing" ? (
        <div className="flex justify-center items-center h-full w-full opacity-50 blur-sm pointer-events-none transition-all duration-500">
          <ResumeDocument config={emptyConfig} db={db} />
        </div>
      ) : (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ResumeDocument config={resumeConfig} db={db} />
        </div>
      )}
    </div>
  );
}
