import { ArrowLeft, Save } from "lucide-react";

export interface ManualBuilderHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ManualBuilderHeader({
  isEditing,
  onCancel,
  onSave,
}: ManualBuilderHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-5 flex justify-between items-center rounded-t-2xl shadow-sm">
      <div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-blue-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vault
        </button>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">
          {isEditing ? "Edit Portfolio" : "Resume Builder"}
        </h2>
      </div>
      <button
        onClick={onSave}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        <Save className="w-4 h-4" /> Save to Vault
      </button>
    </div>
  );
}
