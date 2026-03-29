"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthNavButton from "@/components/auth-nav-button";

type Role = "candidate" | "recruiter";

type NavItem = {
  href: string;
  label: string;
};

const CANDIDATE_NAV: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/portfolio/projects", label: "Projects" },
  { href: "/portfolio/skills", label: "Skills" },
  { href: "/portfolio/experiences", label: "Experiences" },
  { href: "/resume/list", label: "Resumes" },
  { href: "/resume/create", label: "Create Resume" },
  { href: "/resume/access-requests", label: "Access Workflow" },
];

const RECRUITER_NAV: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/hr/filter", label: "HR Filter" },
];

export default function RoleSwitchNav() {
  const [role, setRole] = useState<Role>("candidate");

  useEffect(() => {
    const saved = globalThis.localStorage.getItem("uaps-role") as Role | null;
    if (saved === "candidate" || saved === "recruiter") {
      setRole(saved);
    }
  }, []);

  useEffect(() => {
    globalThis.localStorage.setItem("uaps-role", role);
  }, [role]);

  const navItems = useMemo(() => (role === "candidate" ? CANDIDATE_NAV : RECRUITER_NAV), [role]);

  return (
    <div className="stack gap-sm">
      <div className="role-switch" role="tablist" aria-label="Role switch">
        <button
          type="button"
          className={`role-switch-btn ${role === "candidate" ? "active" : ""}`}
          onClick={() => setRole("candidate")}
        >
          Candidate
        </button>
        <button
          type="button"
          className={`role-switch-btn ${role === "recruiter" ? "active" : ""}`}
          onClick={() => setRole("recruiter")}
        >
          Recruiter
        </button>
      </div>
      <nav className="nav-grid">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="nav-link">
            {item.label}
          </Link>
        ))}
        <AuthNavButton />
      </nav>
    </div>
  );
}
