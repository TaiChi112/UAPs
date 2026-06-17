"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBypassing, setIsBypassing] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    const msg = searchParams.get("message");
    if (err) {
      setError(err);
      if (msg) {
        setErrorMessage(msg);
      }
    }
  }, [searchParams]);

  const handleOAuthLogin = (provider: string) => {
    const returnTo = window.location.origin + "/";
    window.location.href = `${API_BASE_URL}/auth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const handleDevBypass = async () => {
    setIsBypassing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dev-bypass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Dev bypass login request failed");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("dev_bypass_failed");
      setErrorMessage(err instanceof Error ? err.message : "Failed to authenticate with dev bypass");
      setIsBypassing(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Premium Glassmorphic Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/70 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-orange-500/10">
        
        {/* Decorative top blur blobs */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-orange-400/20 blur-2xl"></div>
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl"></div>

        <div className="relative flex flex-col items-center">
          {/* Logo Badge */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>

          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Sign in to UAPS
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Universal Academic Portfolio System
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-4 backdrop-blur-sm">
            <svg className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-red-800">
                Authentication Failure
              </span>
              <span className="text-xs text-red-600/90 leading-normal">
                {errorMessage ?? `Failed to authenticate (Code: ${error}). Please try again.`}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {/* GitHub Button */}
          <button
            onClick={() => handleOAuthLogin("github")}
            className="group flex w-full items-center justify-between rounded-2xl bg-[#181717] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-black/25 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
              Active
            </span>
          </button>

          {/* Google Button */}
          <button
            onClick={() => handleOAuthLogin("google")}
            className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              Active
            </span>
          </button>

          {/* Discord Button */}
          <button
            onClick={() => handleOAuthLogin("discord")}
            className="group flex w-full items-center justify-between rounded-2xl bg-[#5865F2] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4752C4] hover:shadow-indigo-500/25 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a68.09,68.09,0,0,0,76.07,0c.79.71,1.63,1.4,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129,54.65,122.64,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              <span>Continue with Discord</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 group-hover:text-white/70 transition-colors">
              Active
            </span>
          </button>

          {/* Line Button */}
          <button
            onClick={() => handleOAuthLogin("line")}
            className="group flex w-full items-center justify-between rounded-2xl bg-[#06C755] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05B34C] hover:shadow-green-500/25 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3S0 4.6 0 10.3c0 5.1 4.3 9.3 10.1 10.1.4.1.9.3 1 .7.1.3.1.8 0 1.1-.1.4-.4 1.7-.5 2.3-.1.5-.5 2 1.1 1.1 1.6-1 8.6-5.1 11.7-8.7 3.3-3.9.6-6.6.6-6.6zm-15.6 2.5H7.2V9c0-.4-.3-.7-.7-.7s-.7.3-.7.7v4.5c0 .4.3.7.7.7h1.2c.4 0 .7-.3.7-.7s-.3-.7-.7-.7zm3-.7l-1.5-2.2v2.2c0 .4-.3.7-.7.7s-.7-.3-.7-.7V9c0-.4.3-.7.7-.7.2 0 .4.1.5.3l1.5 2.2V9c0-.4.3-.7.7-.7s.7.3.7.7v3.8c0 .4-.3.7-.7.7s-.7-.3-.7-.7zm4.7-.7v.7c0 .4-.3.7-.7.7s-.7-.3-.7-.7v-.7H15c-.4 0-.7-.3-.7-.7V9c0-.4.3-.7.7-.7h1.1c.4 0 .7.3.7.7s-.3.7-.7.7h-.4v.8h.4c.4 0 .7.3.7.7s-.3.7-.7.7zm4.3-1.8H20v.8h.4c.4 0 .7.3.7.7s-.3.7-.7.7H20v.8h.5c.4 0 .7.3.7.7s-.3.7-.7.7h-1.2c-.4 0-.7-.3-.7-.7V9c0-.4.3-.7.7-.7h1.2c.4 0 .7.3.7.7s-.3.7-.7.7z"/>
              </svg>
              <span>Continue with Line</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 group-hover:text-white/70 transition-colors">
              Active
            </span>
          </button>

          {/* Facebook Button */}
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="group flex w-full items-center justify-between rounded-2xl bg-[#1877F2] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#166FE5] hover:shadow-blue-500/25 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
              <span>Continue with Facebook</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              Mock
            </span>
          </button>

          {/* Instagram Button */}
          <button
            onClick={() => handleOAuthLogin("instagram")}
            className="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pink-500/25 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Continue with Instagram</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/60">
              Mock
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-[#faf8f5] px-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            Local Development
          </span>
        </div>

        {/* Dev Bypass Section */}
        <div className="flex flex-col items-center">
          <button
            disabled={isBypassing}
            onClick={handleDevBypass}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 hover:shadow active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBypassing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
            ) : (
              <svg className="h-4 w-4 fill-amber-500 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            )}
            <span>{isBypassing ? "Bypassing..." : "Dev Bypass Login"}</span>
          </button>
          <span className="mt-2 text-[10px] text-slate-400">
            Instantly log in as developer Maya Chen
          </span>
        </div>

      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500"></div>
          <p className="text-sm font-medium text-slate-400">Loading Form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
