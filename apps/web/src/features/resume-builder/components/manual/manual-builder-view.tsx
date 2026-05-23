import type { FormEvent } from "react";

import type {
  AwardId,
  CertificateId,
  ExperienceId,
  NewProjectDraft,
  ProjectId,
  ResumeConfig,
  SkillId,
  VaultData,
} from "@uaps/shared/resume-builder";

import { ResumeDocument } from "../preview/resume-document";
import { ExperienceCertificatesSection } from "./experience-certificates-section";
import { ManualBuilderHeader } from "./manual-builder-header";
import { ProjectsSection } from "./projects-section";
import { RoleSummarySection } from "./role-summary-section";
import { SkillsSection } from "./skills-section";

export interface ManualBuilderViewProps {
  isEditing: boolean;
  db: VaultData;
  config: ResumeConfig;
  newSkill: string;
  showProjectForm: boolean;
  newProject: NewProjectDraft;
  onCancel: () => void;
  onSave: () => void;
  onTargetRoleChange: (value: string) => void;
  onTargetCompanyChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onToggleSkill: (skillId: SkillId) => void;
  onNewSkillChange: (value: string) => void;
  onAddSkill: (event: FormEvent<HTMLFormElement>) => void;
  onToggleProject: (projectId: ProjectId) => void;
  onShowProjectForm: () => void;
  onHideProjectForm: () => void;
  onProjectDraftChange: (draft: NewProjectDraft) => void;
  onAddProject: (event: FormEvent<HTMLFormElement>) => void;
  onToggleExperience: (experienceId: ExperienceId) => void;
  onToggleCert: (certificateId: CertificateId) => void;
  onToggleAward: (awardId: AwardId) => void;
}

export function ManualBuilderView({
  isEditing,
  db,
  config,
  newSkill,
  showProjectForm,
  newProject,
  onCancel,
  onSave,
  onTargetRoleChange,
  onTargetCompanyChange,
  onSummaryChange,
  onToggleSkill,
  onNewSkillChange,
  onAddSkill,
  onToggleProject,
  onShowProjectForm,
  onHideProjectForm,
  onProjectDraftChange,
  onAddProject,
  onToggleExperience,
  onToggleCert,
  onToggleAward,
}: ManualBuilderViewProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[90vh]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <ManualBuilderHeader
            isEditing={isEditing}
            onCancel={onCancel}
            onSave={onSave}
          />

          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            <RoleSummarySection
              config={config}
              onTargetRoleChange={onTargetRoleChange}
              onTargetCompanyChange={onTargetCompanyChange}
              onSummaryChange={onSummaryChange}
            />

            <SkillsSection
              skills={db.skills}
              selectedSkillIds={config.selectedSkills}
              newSkill={newSkill}
              onToggleSkill={onToggleSkill}
              onNewSkillChange={onNewSkillChange}
              onAddSkill={onAddSkill}
            />

            <ProjectsSection
              projects={db.projects}
              selectedProjectIds={config.selectedProjects}
              showProjectForm={showProjectForm}
              newProject={newProject}
              onToggleProject={onToggleProject}
              onShowProjectForm={onShowProjectForm}
              onHideProjectForm={onHideProjectForm}
              onProjectDraftChange={onProjectDraftChange}
              onAddProject={onAddProject}
            />

            <ExperienceCertificatesSection
              experience={db.experience}
              certificates={db.certificates}
              awards={db.awards}
              selectedExperienceIds={config.selectedExperience}
              selectedCertIds={config.selectedCerts}
              selectedAwardIds={config.selectedAwards}
              onToggleExperience={onToggleExperience}
              onToggleCert={onToggleCert}
              onToggleAward={onToggleAward}
            />
          </div>
        </div>

        <div className="overflow-y-auto hidden lg:block rounded-2xl shadow-xl border-slate-200 border bg-white p-2">
          <ResumeDocument config={config} db={db} />
        </div>
      </div>
    </div>
  );
}
