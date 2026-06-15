import { FileText, X } from "lucide-react";

import type { ResumeConfig, VaultData } from "@uaps/shared/resume-builder";

import { ResumeDocument } from "./resume-document";

export interface MobilePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config?: ResumeConfig;
  db?: VaultData;
  isLoading?: boolean;
}

export function MobilePreviewDrawer({
  isOpen,
  onClose,
  config,
  db,
  isLoading,
}: MobilePreviewDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] sm:w-[400px] max-w-full bg-slate-100 z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl border-l border-slate-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-white px-4 py-4 border-b flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-2 sm:p-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>Loading preview...</p>
            </div>
          ) : config && db ? (
            <ResumeDocument config={config} db={db} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No preview available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
