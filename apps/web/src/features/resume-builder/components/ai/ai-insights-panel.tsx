import { AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

import type { AiFeedback } from "@uaps/shared/resume-builder";

export interface AiInsightsPanelProps {
  feedback: AiFeedback;
  onFixMissingSkill: (skill: string) => void;
}

export function AiInsightsPanel({
  feedback,
  onFixMissingSkill,
}: AiInsightsPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> AI Insights
          </h2>
          <p className="text-xs text-slate-500 mt-1">Based on Vault data</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-indigo-600">
            {feedback.matchScore}%
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Match Score
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {feedback.missingSkills.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" /> Missing Requirements
            </h4>
            <p className="text-xs text-amber-700 mb-3">
              The JD asked for these, but they aren&apos;t in your vault. Have
              you used them?
            </p>
            <div className="space-y-2">
              {feedback.missingSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex justify-between items-center bg-white border border-amber-100 p-2 rounded-lg shadow-sm"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {skill}
                  </span>
                  <button
                    onClick={() => onFixMissingSkill(skill)}
                    className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded font-medium transition-colors"
                  >
                    + Add to Vault
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-800">
              Perfect Match!
            </h4>
            <p className="text-xs text-emerald-700">
              You have all the required skills in your vault.
            </p>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
          <strong>Note:</strong> The AI has automatically rewritten your
          Executive Summary and selected relevant projects/skills to match the
          JD.
        </div>
      </div>
    </div>
  );
}
