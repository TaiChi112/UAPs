import Link from "next/link";
import { getSessionServer, getSummaryServer } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [session, summary] = await Promise.all([getSessionServer(), getSummaryServer()]);

  const counts = summary?.counts ?? {
    projects: 0,
    skills: 0,
    experiences: 0,
    resumes: 0,
  };

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h2 className="section-title">MVP Progress Overview</h2>
        <p className="subtle">
          {session
            ? `Signed in as ${session.name} (@${session.githubLogin})`
            : "Sign in with GitHub to access your portfolio data."}
        </p>
      </div>

      <div className="mvp-grid">
        <article className="stat-card">
          <p className="eyebrow">Projects</p>
          <p className="stat-value">{counts.projects}</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Skills</p>
          <p className="stat-value">{counts.skills}</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Experiences</p>
          <p className="stat-value">{counts.experiences}</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Resumes</p>
          <p className="stat-value">{counts.resumes}</p>
        </article>
      </div>

      <div className="inline-list">
        <Link href="/portfolio/projects" className="btn-secondary">
          Manage Projects
        </Link>
        <Link href="/portfolio/skills" className="btn-secondary">
          Manage Skills
        </Link>
        <Link href="/portfolio/experiences" className="btn-secondary">
          Manage Experiences
        </Link>
        <Link href="/resume/list" className="btn-primary">
          Manage Resumes
        </Link>
      </div>
    </section>
  );
}
