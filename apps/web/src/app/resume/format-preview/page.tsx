import { mockResumeFormat } from "@/lib/mock-resume-format";

export default function ResumeFormatPreviewPage() {
  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Resume Format</p>
        <h2 className="section-title">PDF Style Mock Preview</h2>
        <p className="subtle">Structured from your uploaded PDF format with mock content for review.</p>
      </div>

      <article className="resume-doc">
        <header className="resume-doc-header stack gap-sm">
          <h1>{mockResumeFormat.fullName}</h1>
          <p className="resume-role">{mockResumeFormat.targetRole}</p>

          <div className="resume-contact-line">
            <span>{mockResumeFormat.location}</span>
            <span>{mockResumeFormat.email}</span>
            <span>{mockResumeFormat.phone}</span>
          </div>

          <div className="resume-link-line">
            {mockResumeFormat.links.map((link) => (
              <span key={link.label}>
                {link.label}: {link.value}
              </span>
            ))}
          </div>
        </header>

        <section className="stack gap-sm">
          <h3 className="resume-section-title">Summary</h3>
          <p>{mockResumeFormat.summary}</p>
        </section>

        <section className="stack gap-sm">
          <h3 className="resume-section-title">Projects</h3>
          {mockResumeFormat.projects.map((project) => (
            <article key={project.title} className="stack gap-sm resume-project-item">
              <div className="resume-project-title-row">
                <h4>{project.title}</h4>
                <p>
                  {project.date} | {project.tag}
                </p>
              </div>

              <ul className="resume-bullets">
                <li>
                  <strong>Problem/Motivation:</strong> {project.problem}
                </li>
                <li>
                  <strong>Solution/Benefit:</strong> {project.solution}
                </li>
              </ul>
            </article>
          ))}
        </section>

        <section className="stack gap-sm">
          <h3 className="resume-section-title">Skills</h3>
          <ul className="resume-bullets">
            {mockResumeFormat.skills.map((group) => (
              <li key={group.label}>
                <strong>{group.label}:</strong> {group.items.join(", ")}
              </li>
            ))}
          </ul>
        </section>

        <section className="stack gap-sm">
          <h3 className="resume-section-title">Education</h3>
          <div className="stack gap-sm">
            <p>
              <strong>{mockResumeFormat.education.degree}</strong>
            </p>
            <p>{mockResumeFormat.education.institution}</p>
            <p>{mockResumeFormat.education.graduation}</p>
            <ul className="resume-bullets">
              <li>
                <strong>Relevant Coursework:</strong> {mockResumeFormat.education.coursework.join(", ")}
              </li>
            </ul>
          </div>
        </section>

        <section className="stack gap-sm">
          <h3 className="resume-section-title">Additional Information</h3>
          <ul className="resume-bullets">
            {mockResumeFormat.additionalInfo.map((info) => (
              <li key={info}>{info}</li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  );
}
