import { Award, Briefcase, CheckCircle } from "lucide-react";

import type {
  AwardId,
  CertificateId,
  ExperienceId,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";

export interface ExperienceCertificatesSectionProps {
  experience: VaultData["experience"];
  certificates: VaultData["certificates"];
  awards: VaultData["awards"];
  selectedExperienceIds: ResumeConfig["selectedExperience"];
  selectedCertIds: ResumeConfig["selectedCerts"];
  selectedAwardIds: ResumeConfig["selectedAwards"];
  onToggleExperience: (experienceId: ExperienceId) => void;
  onToggleCert: (certificateId: CertificateId) => void;
  onToggleAward: (awardId: AwardId) => void;
}

export function ExperienceCertificatesSection({
  experience,
  certificates,
  awards,
  selectedExperienceIds,
  selectedCertIds,
  selectedAwardIds,
  onToggleExperience,
  onToggleCert,
  onToggleAward,
}: ExperienceCertificatesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section className="space-y-3">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
          <Briefcase className="w-4 h-4" /> Experience
        </h3>
        {experience.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-2 text-sm cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedExperienceIds.includes(item.id)}
              onChange={() => onToggleExperience(item.id)}
              className="mt-1 accent-blue-600"
            />
            <div>
              <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                {item.role}
              </div>
              <div className="text-xs text-slate-500">{item.company}</div>
            </div>
          </label>
        ))}
      </section>
      <section className="space-y-3">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
          <CheckCircle className="w-4 h-4" /> Certificates
        </h3>
        {certificates.map((certificate) => (
          <label
            key={certificate.id}
            className="flex items-start gap-2 text-sm cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedCertIds.includes(certificate.id)}
              onChange={() => onToggleCert(certificate.id)}
              className="mt-1 accent-blue-600"
            />
            <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
              {certificate.name}
            </div>
          </label>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
          <Award className="w-4 h-4" /> Awards
        </h3>
        {awards.map((award) => (
          <label
            key={award.id}
            className="flex items-start gap-2 text-sm cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedAwardIds.includes(award.id)}
              onChange={() => onToggleAward(award.id)}
              className="mt-1 accent-blue-600"
            />
            <div>
              <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                {award.name}
              </div>
              {award.desc && (
                <div className="text-xs text-slate-500">{award.desc}</div>
              )}
            </div>
          </label>
        ))}
      </section>
    </div>
  );
}
