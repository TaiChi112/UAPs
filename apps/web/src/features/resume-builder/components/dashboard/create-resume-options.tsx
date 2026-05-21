import { Plus, Sparkles } from "lucide-react";

export interface CreateResumeOptionsProps {
  onCreateManual: () => void;
  onCreateAi: () => void;
}

export function CreateResumeOptions({
  onCreateManual,
  onCreateAi,
}: CreateResumeOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        onClick={onCreateManual}
        className="bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-md p-6 rounded-2xl cursor-pointer transition-all group flex items-start gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center shrink-0 transition-colors">
          <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
            Create Manually
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Start from scratch. Select items from your vault to build a
            tailored resume.
          </p>
        </div>
      </div>

      <div
        onClick={onCreateAi}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-md p-6 rounded-2xl cursor-pointer transition-all group flex items-start gap-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-bl-lg tracking-wider">
          New
        </div>
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-indigo-900 group-hover:text-indigo-700 transition-colors">
            Auto-Tailor with AI
          </h3>
          <p className="text-sm text-indigo-700/70 mt-1">
            Paste a Job Description. Let AI scan your vault and build the
            perfect match.
          </p>
        </div>
      </div>
    </div>
  );
}
