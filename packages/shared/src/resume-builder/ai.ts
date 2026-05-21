import type { AiFeedback, ResumeConfig, VaultData } from "./models";

export type AnalyzeJobDescriptionRequest = {
  jobDescription: string;
  vault: VaultData;
  currentConfig: ResumeConfig;
};

export type AnalyzeJobDescriptionResult = {
  suggestedConfig: ResumeConfig;
  feedback: AiFeedback;
};

export interface ResumeAnalysisService {
  analyzeJobDescription(
    request: AnalyzeJobDescriptionRequest,
  ): Promise<AnalyzeJobDescriptionResult>;
}
