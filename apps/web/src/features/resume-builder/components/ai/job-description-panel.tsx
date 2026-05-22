import { Play, Sparkles } from "lucide-react";

export interface JobDescriptionPanelProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onUseSample: () => void;
  onAnalyze: () => void;
}

export function JobDescriptionPanel({
  jobDescription,
  onJobDescriptionChange,
  onUseSample,
  onAnalyze,
}: JobDescriptionPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-lg mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Paste Job Description
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          AI will match your vault data and rewrite your summary to fit the
          role perfectly.
        </p>
      </div>

      <textarea
        className="w-full flex-1 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none bg-slate-50"
        placeholder="Paste the requirements or JD text here..."
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
      />

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onUseSample}
          className="text-xs text-indigo-600 hover:underline text-left"
        >
          Use Sample JD
        </button>
        <button
          onClick={onAnalyze}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" /> Analyze & Generate
        </button>
      </div>
    </div>
  );
}
