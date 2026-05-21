"use client";

import { useContext } from "react";

import { ResumeBuilderContext } from "./context";

export function useResumeBuilder() {
  const context = useContext(ResumeBuilderContext);

  if (!context) {
    throw new Error(
      "useResumeBuilder must be used within a ResumeBuilderProvider",
    );
  }

  return context;
}
