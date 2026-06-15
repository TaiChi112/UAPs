import * as React from "react";
import { Eye } from "lucide-react";

import type {
  AiAnalysisState,
  AiFeedback,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";

import { AiBuilderHeader } from "./ai-builder-header";
import { AiInsightsPanel } from "./ai-insights-panel";
import { AiPreviewPanel } from "./ai-preview-panel";
import { AnalysisLoadingPanel } from "./analysis-loading-panel";
import { JobDescriptionPanel } from "./job-description-panel";
import { ToastBanner } from "../shared/toast-banner";
import { MobilePreviewDrawer } from "../preview/mobile-preview-drawer";

export interface AiBuilderViewProps {
  toastMessage?: string | null;
  aiAnalysisState: AiAnalysisState;
  aiFeedback: AiFeedback;
  db: VaultData;
  jobDescription: string;
  emptyConfig: ResumeConfig;
  resumeConfig: ResumeConfig;
  onBack: () => void;
  onSwitchToManual: () => void;
  onSave: () => void;
  onJobDescriptionChange: (value: string) => void;
  onUseSample: () => void;
  onAnalyze: () => void;
  onFixMissingSkill: (skill: string) => void;
}

export function AiBuilderView({
  toastMessage,
  aiAnalysisState,
  aiFeedback,
  db,
  jobDescription,
  emptyConfig,
  resumeConfig,
  onBack,
  onSwitchToManual,
  onSave,
  onJobDescriptionChange,
  onUseSample,
  onAnalyze,
  onFixMissingSkill,
}: AiBuilderViewProps) {
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans relative">
      {toastMessage && <ToastBanner message={toastMessage} />}

      <AiBuilderHeader
        canSave={aiAnalysisState === "done"}
        onBack={onBack}
        onSwitchToManual={onSwitchToManual}
        onSave={onSave}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[80vh]">
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          {aiAnalysisState === "idle" && (
            <JobDescriptionPanel
              jobDescription={jobDescription}
              onJobDescriptionChange={onJobDescriptionChange}
              onUseSample={onUseSample}
              onAnalyze={onAnalyze}
            />
          )}

          {aiAnalysisState === "analyzing" && <AnalysisLoadingPanel />}

          {aiAnalysisState === "done" && (
            <AiInsightsPanel
              feedback={aiFeedback}
              onFixMissingSkill={onFixMissingSkill}
            />
          )}
        </div>

        <div className="hidden lg:flex lg:col-span-8">
          <AiPreviewPanel
            aiAnalysisState={aiAnalysisState}
            db={db}
            emptyConfig={emptyConfig}
            resumeConfig={resumeConfig}
          />
        </div>
      </div>

      <button
        className="fixed bottom-6 right-6 lg:hidden z-30 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-colors flex items-center justify-center animate-bounce"
        onClick={() => setIsMobilePreviewOpen(true)}
      >
        <Eye className="w-6 h-6" />
      </button>

      <MobilePreviewDrawer
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        config={aiAnalysisState === "done" ? resumeConfig : emptyConfig}
        db={db}
        isLoading={aiAnalysisState === "analyzing"}
      />
    </div>
  );
}
