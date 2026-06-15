import { Building, FileText } from "lucide-react";

import type { ResumeConfig, VaultData } from "@uaps/shared/resume-builder";

export interface ResumeDocumentProps {
  config: ResumeConfig;
  db: VaultData;
}

export function ResumeDocument({ config, db }: ResumeDocumentProps) {
  const previewData = {
    skills: db.skills.filter((skill) => config.selectedSkills.includes(skill.id)),
    projects: db.projects.filter((project) =>
      config.selectedProjects.includes(project.id),
    ),
    experience: db.experience.filter((item) =>
      config.selectedExperience.includes(item.id),
    ),
    certificates: db.certificates.filter((certificate) =>
      config.selectedCerts.includes(certificate.id),
    ),
    awards: db.awards.filter((award) =>
      config.selectedAwards.includes(award.id),
    ),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 w-full max-w-[800px] mx-auto relative min-h-[800px] flex flex-col">
      <div className="text-center mb-6 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {db.basicInfo.name}
        </h1>

        {(config.targetRole || config.targetCompany) && (
          <div className="text-blue-600 font-semibold mt-2 text-lg">
            {config.targetRole}{" "}
            {config.targetCompany && `@ ${config.targetCompany}`}
          </div>
        )}

        <div className="flex justify-center gap-4 text-sm text-slate-500 mt-3">
          <span>{db.basicInfo.email}</span>
          <span>•</span>
          <span>{db.basicInfo.phone}</span>
        </div>

        {config.summary && (
          <p className="mt-4 text-slate-700 text-sm leading-relaxed max-w-2xl mx-auto italic">
            &quot;{config.summary}&quot;
          </p>
        )}
      </div>

      <div className="space-y-6 flex-1">
        {(config.sectionOrder || ["skills", "projects", "experience", "certificates", "awards"]).map((section) => {
          switch (section) {
            case "skills":
              return previewData.skills.length > 0 && (
                <div key="skills">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {previewData.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            case "experience":
              return previewData.experience.length > 0 && (
                <div key="experience">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {previewData.experience.map((experience) => (
                      <div key={experience.id}>
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-slate-900">
                            {experience.role}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {experience.duration}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mb-1 flex items-center gap-1">
                          <Building className="w-3 h-3" /> {experience.company}
                        </div>
                        {experience.responsibilities && (
                          <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-sm text-slate-700">
                            {experience.responsibilities.split("\n").filter(line => line.trim()).map((line, idx) => (
                              <li key={idx}>{line.trim()}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "projects":
              return previewData.projects.length > 0 && (
                <div key="projects">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                    Key Projects
                  </h3>
                  <div className="space-y-4">
                    {previewData.projects.map((project) => (
                      <div key={project.id}>
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-slate-900">
                            {project.githubUrl ? (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-blue-600 hover:underline"
                              >
                                {project.title}
                              </a>
                            ) : (
                              project.title
                            )}
                          </h4>
                          {project.duration && (
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-4">
                              {project.duration}
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-sm text-slate-700">
                            {project.description.split("\n").filter(line => line.trim()).map((line, idx) => (
                              <li key={idx}>{line.trim()}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            case "certificates":
              return previewData.certificates.length > 0 && (
                <div key="certificates">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                    Certifications
                  </h3>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {previewData.certificates.map((certificate) => (
                      <li key={certificate.id}>
                        {certificate.name} ({certificate.year})
                      </li>
                    ))}
                  </ul>
                </div>
              );
            case "awards":
              return previewData.awards.length > 0 && (
                <div key="awards">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                    Awards
                  </h3>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {previewData.awards.map((award) => (
                      <li key={award.id}>
                        <span className="font-medium text-slate-800">
                          {award.name}
                        </span>
                        {award.desc && `: ${award.desc}`}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            default:
              return null;
          }
        })}

        {previewData.skills.length === 0 &&
          previewData.projects.length === 0 &&
          previewData.experience.length === 0 &&
          previewData.certificates.length === 0 &&
          previewData.awards.length === 0 && (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your resume is currently empty.</p>
              <p className="text-sm">
                Content will appear here as you select it.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
