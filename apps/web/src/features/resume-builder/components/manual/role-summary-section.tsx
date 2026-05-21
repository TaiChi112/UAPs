import { User } from "lucide-react";

import type { ResumeConfig } from "@uaps/shared/resume-builder";

export interface RoleSummarySectionProps {
  config: ResumeConfig;
  onTargetRoleChange: (value: string) => void;
  onTargetCompanyChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
}

export function RoleSummarySection({
  config,
  onTargetRoleChange,
  onTargetCompanyChange,
  onSummaryChange,
}: RoleSummarySectionProps) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <User className="w-4 h-4" /> Role & Summary
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Target Role
          </label>
          <input
            type="text"
            placeholder="e.g. AI Engineer"
            className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={config.targetRole}
            onChange={(event) => onTargetRoleChange(event.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Target Company
          </label>
          <input
            type="text"
            placeholder="e.g. Company A"
            className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={config.targetCompany}
            onChange={(event) => onTargetCompanyChange(event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Executive Summary
        </label>
        <textarea
          placeholder="Tailor your summary..."
          className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-20"
          value={config.summary}
          onChange={(event) => onSummaryChange(event.target.value)}
        />
      </div>
    </section>
  );
}
