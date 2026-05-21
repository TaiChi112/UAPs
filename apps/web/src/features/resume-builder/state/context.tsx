"use client";

import { createContext, useEffect, useReducer, useState } from "react";

import { initialResumeBuilderState } from "./initial-state";
import { resumeBuilderReducer } from "./reducer";
import type {
  ResumeBuilderContextValue,
  ResumeBuilderProviderProps,
} from "./resume-builder.types";

import { getResumeBuilderRepository } from "@/features/resume-builder/services/repositories";

export const ResumeBuilderContext = createContext<
  ResumeBuilderContextValue | undefined
>(undefined);

export function ResumeBuilderProvider({
  children,
}: ResumeBuilderProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, dispatch] = useReducer(
    resumeBuilderReducer,
    initialResumeBuilderState,
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateSnapshot = async () => {
      try {
        const snapshot = await getResumeBuilderRepository().loadSnapshot();

        if (!isMounted) {
          return;
        }

        dispatch({
          type: "data/hydrateSnapshot",
          payload: { snapshot },
        });
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateSnapshot();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.ui.toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: "ui/clearToast" });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [state.ui.toastMessage]);

  return (
    <ResumeBuilderContext.Provider value={{ isHydrated, state, dispatch }}>
      {children}
    </ResumeBuilderContext.Provider>
  );
}
