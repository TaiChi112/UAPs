import { ArrowLeft, Save } from "lucide-react";

export interface AiBuilderHeaderProps {
  canSave: boolean;
  onBack: () => void;
  onSwitchToManual: () => void;
  onSave: () => void;
}

export function AiBuilderHeader({
  canSave,
  onBack,
  onSwitchToManual,
  onSave,
}: AiBuilderHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      {canSave && (
        <div className="flex gap-3">
          <button
            onClick={onSwitchToManual}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Switch to Manual Edit
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save AI Draft
          </button>
        </div>
      )}
    </div>
  );
}
