"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Briefcase, LogOut, User as UserIcon } from "lucide-react";
import { ResumeBuilderProvider } from "@/features/resume-builder/state/context";
import { SessionGuard, useSession } from "@/components/session-guard";

import { logout } from "@/lib/api";

function HeaderContent() {
  const { user } = useSession();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60 transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-0.5">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                UAPS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-black">Resume</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Portfolio System</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-1">
            <Link href="/" className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">
              Public Feed
            </Link>
            {user && (
              <Link href="/vault" className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors">
                My Vault
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="hidden flex-col items-end md:flex">
                <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
                <span className="mt-1 text-xs text-slate-500 font-medium leading-none">{user.email}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/60 text-xs sm:text-sm font-bold text-blue-700 shadow-sm ring-2 ring-white">
                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || <UserIcon className="h-4 w-4" />}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function ResumeBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <SessionGuard>
        <ResumeBuilderProvider>
          <HeaderContent />
          <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8">
            {children}
          </main>
        </ResumeBuilderProvider>
      </SessionGuard>
    </div>
  );
}
