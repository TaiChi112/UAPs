import { Sparkles } from "lucide-react";

export function AnalysisLoadingPanel() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 relative mb-6">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <Sparkles className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">
        AI is working its magic...
      </h3>
      <p className="text-sm text-slate-500 mt-2 space-y-1">
        <span className="block animate-pulse">Analyzing Job Description...</span>
        <span className="block animate-pulse delay-75">
          Scanning your Data Vault...
        </span>
        <span className="block animate-pulse delay-150">
          Rewriting Executive Summary...
        </span>
      </p>
    </div>
  );
}
