import type { ReactNode } from "react";

import { ResumeBuilderProvider } from "@/features/resume-builder/state/context";

export default function ResumeBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ResumeBuilderProvider>
      <div className="stack gap-sm">
        <header className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Resume Builder
              </p>
              <h1 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">
                Tailor, analyze, and export production-ready resumes
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Local single-player mode is active for development.
              </p>
            </div>

            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Local Dev Mode
            </div>
          </div>
        </header>

        {children}
      </div>
    </ResumeBuilderProvider>
  );
}
