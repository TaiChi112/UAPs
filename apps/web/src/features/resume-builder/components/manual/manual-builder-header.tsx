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
    <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
      <div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {isEditing ? "Edit Resume" : "Manual Builder"}
        </h2>
      </div>
      <button
        onClick={onSave}
        className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
      >
        <Save className="w-4 h-4" /> Save to Vault
      </button>
    </div>
  );
}
