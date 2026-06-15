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

        <AiPreviewPanel
          aiAnalysisState={aiAnalysisState}
          db={db}
          emptyConfig={emptyConfig}
          resumeConfig={resumeConfig}
        />
      </div>
    </div>
  );
}
