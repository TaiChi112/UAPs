"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

type SessionUser = {
  githubLogin: string;
};

type AuthSessionEnvelope = {
  ok: boolean;
  data?: SessionUser | null;
};

export default function AuthNavButton() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!mounted) {
            return;
          }

          setIsSignedIn(false);
          setGithubLogin(null);
          return;
        }

        const body = (await response.json()) as AuthSessionEnvelope;
        const login = body.data?.githubLogin ?? null;

        if (!mounted) {
          return;
        }

        setIsSignedIn(Boolean(body.ok && login));
        setGithubLogin(login);
      } catch {
        if (!mounted) {
          return;
        }

        setIsSignedIn(false);
        setGithubLogin(null);
      } finally {
        if (mounted) {
          setIsBusy(false);
        }
      }
    };

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSignIn = () => {
    window.location.assign("/auth/login");
  };

  const handleSignOut = async () => {
    setIsBusy(true);

    try {
      await fetch("/auth/logout", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setIsSignedIn(false);
      setGithubLogin(null);
      window.location.assign("/");
    }
  };

  if (isBusy) {
    return (
      <button type="button" className="nav-link nav-link-strong" disabled>
        Loading...
      </button>
    );
  }

  if (isSignedIn) {
    return (
      <button type="button" className="nav-link nav-link-strong" onClick={handleSignOut}>
        Sign out{githubLogin ? ` @${githubLogin}` : ""}
      </button>
    );
  }

  return (
    <button type="button" className="nav-link nav-link-strong" onClick={handleSignIn}>
      Sign in
    </button>
  );
}