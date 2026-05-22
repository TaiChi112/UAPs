import type { ResumeAnalysisService } from "@uaps/shared/resume-builder";

import { ApiResumeAnalysisService } from "./api-resume-analysis.service";

let resumeAnalysisService: ResumeAnalysisService | null = null;

export const getResumeAnalysisService = (): ResumeAnalysisService => {
  if (!resumeAnalysisService) {
    resumeAnalysisService = new ApiResumeAnalysisService();
  }

  return resumeAnalysisService;
};
