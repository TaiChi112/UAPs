"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type SessionUser } from "@/lib/api";

type SessionContextType = {
  user: SessionUser | null;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
});

export const useSession = () => useContext(SessionContext);

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const sessionUser = await getSession();
        if (isMounted) {
          if (sessionUser) {
            setUser(sessionUser);
          } else {
            router.push("/auth/login");
          }
        }
      } catch (err) {
        console.error("Session verification failed", err);
        if (isMounted) {
          router.push("/auth/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xs font-semibold tracking-widest text-orange-600/80 animate-pulse uppercase">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}
