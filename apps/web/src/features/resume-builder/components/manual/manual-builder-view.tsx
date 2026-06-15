import * as React from "react";
import type { FormEvent } from "react";
import { Eye } from "lucide-react";

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
import { MobilePreviewDrawer } from "../preview/mobile-preview-drawer";
import { ExperienceSection } from "./experiences-section";
import { CertificatesSection } from "./certificates-section";
import { AwardsSection } from "./awards-section";
import { ManualBuilderHeader } from "./manual-builder-header";
import { ProjectsSection } from "./projects-section";
import { RoleSummarySection } from "./role-summary-section";
import { SectionOrderEditor } from "./section-order-editor";
import { SkillsSection } from "./skills-section";

export interface ManualBuilderViewProps {
  isEditing: boolean;
  db: VaultData;
  config: ResumeConfig;
  newSkill: string;
  showProjectForm: boolean;
  newProject: NewProjectDraft;
  showExperienceForm: boolean;
  newExperience: import("@uaps/shared/resume-builder").NewExperienceDraft;
  showCertificateForm: boolean;
  newCertificate: import("@uaps/shared/resume-builder").NewCertificateDraft;
  showAwardForm: boolean;
  newAward: import("@uaps/shared/resume-builder").NewAwardDraft;
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
  onShowExperienceForm: () => void;
  onHideExperienceForm: () => void;
  onExperienceDraftChange: (draft: import("@uaps/shared/resume-builder").NewExperienceDraft) => void;
  onAddExperience: (event: FormEvent<HTMLFormElement>) => void;
  onToggleCert: (certificateId: CertificateId) => void;
  onShowCertificateForm: () => void;
  onHideCertificateForm: () => void;
  onCertificateDraftChange: (draft: import("@uaps/shared/resume-builder").NewCertificateDraft) => void;
  onAddCertificate: (event: FormEvent<HTMLFormElement>) => void;
  onToggleAward: (awardId: AwardId) => void;
  onShowAwardForm: () => void;
  onHideAwardForm: () => void;
  onAwardDraftChange: (draft: import("@uaps/shared/resume-builder").NewAwardDraft) => void;
  onAddAward: (event: FormEvent<HTMLFormElement>) => void;
  onSectionOrderChange: (newOrder: string[]) => void;
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
  showExperienceForm,
  newExperience,
  onToggleExperience,
  onShowExperienceForm,
  onHideExperienceForm,
  onExperienceDraftChange,
  onAddExperience,
  showCertificateForm,
  newCertificate,
  onToggleCert,
  onShowCertificateForm,
  onHideCertificateForm,
  onCertificateDraftChange,
  onAddCertificate,
  showAwardForm,
  newAward,
  onToggleAward,
  onShowAwardForm,
  onHideAwardForm,
  onAwardDraftChange,
  onAddAward,
  onSectionOrderChange,
}: ManualBuilderViewProps) {
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = React.useState(false);

  const activeSections = [
    config.selectedSkills.length > 0 ? "skills" : null,
    config.selectedProjects.length > 0 ? "projects" : null,
    config.selectedExperience.length > 0 ? "experience" : null,
    config.selectedCerts.length > 0 ? "certificates" : null,
    config.selectedAwards.length > 0 ? "awards" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 font-sans relative">
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

            <ExperienceSection
              experience={db.experience}
              selectedExperienceIds={config.selectedExperience}
              showExperienceForm={showExperienceForm}
              newExperience={newExperience}
              onToggleExperience={onToggleExperience}
              onShowExperienceForm={onShowExperienceForm}
              onHideExperienceForm={onHideExperienceForm}
              onExperienceDraftChange={onExperienceDraftChange}
              onAddExperience={onAddExperience}
            />

            <CertificatesSection
              certificates={db.certificates}
              selectedCertificateIds={config.selectedCerts}
              showCertificateForm={showCertificateForm}
              newCertificate={newCertificate}
              onToggleCertificate={onToggleCert}
              onShowCertificateForm={onShowCertificateForm}
              onHideCertificateForm={onHideCertificateForm}
              onCertificateDraftChange={onCertificateDraftChange}
              onAddCertificate={onAddCertificate}
            />

            <AwardsSection
              awards={db.awards}
              selectedAwardIds={config.selectedAwards}
              showAwardForm={showAwardForm}
              newAward={newAward}
              onToggleAward={onToggleAward}
              onShowAwardForm={onShowAwardForm}
              onHideAwardForm={onHideAwardForm}
              onAwardDraftChange={onAwardDraftChange}
              onAddAward={onAddAward}
            />

            <SectionOrderEditor
              sectionOrder={config.sectionOrder || ["skills", "projects", "experience", "certificates", "awards"]}
              activeSections={activeSections}
              onChange={onSectionOrderChange}
            />
          </div>
        </div>

        <div className="overflow-y-auto hidden lg:block rounded-2xl shadow-xl border-slate-200 border bg-white p-2">
          <ResumeDocument config={config} db={db} />
        </div>
      </div>

      <button
        className="fixed bottom-6 right-6 lg:hidden z-30 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-colors flex items-center justify-center animate-bounce"
        onClick={() => setIsMobilePreviewOpen(true)}
      >
        <Eye className="w-6 h-6" />
      </button>

      <MobilePreviewDrawer
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        config={config}
        db={db}
      />
    </div>
  );
}
