import Link from "next/link";
import HrResumeMarketplace from "@/components/hr-resume-marketplace";

export default function Home() {
  return (
    <section className="stack gap-xl">
      <article className="hero-card">
        <p className="eyebrow">MVP TRACK</p>
        <h2>Build portfolio once. Tailor every resume version in minutes.</h2>
        <p>
          This implementation starts with a complete vertical slice: data capture, resume composition,
          preview, and export endpoints (JSON/Markdown now, PDF/Image next).
        </p>
        <div className="action-row">
          <Link href="/dashboard" className="btn-primary">
            Open Dashboard
          </Link>
          <Link href="/resume/create" className="btn-secondary">
            Create Resume
          </Link>
        </div>
      </article>

      <article className="panel-grid">
        <div className="mini-panel">
          <h3>Portfolio Inputs</h3>
          <p>Capture projects, skills, and experiences as your source of truth.</p>
        </div>
        <div className="mini-panel">
          <h3>Cherry-pick Resume Content</h3>
          <p>Compose multiple resume versions by role and target company.</p>
        </div>
        <div className="mini-panel">
          <h3>Export Pipeline</h3>
          <p>Use JSON and Markdown now. Plug PDF/Image renderers in the next milestone.</p>
        </div>
      </article>

      <HrResumeMarketplace
        title="Recruiter Marketplace"
        eyebrow="Live Demo"
        description="Simulate recruiter sourcing: filter by role, skills, and experience, then preview candidates and request controlled access."
      />
    </section>
  );
}
