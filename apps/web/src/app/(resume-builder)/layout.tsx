import type { ReactNode } from "react";

import { ResumeBuilderProvider } from "@/features/resume-builder/state/context";

export default function ResumeBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ResumeBuilderProvider>{children}</ResumeBuilderProvider>;
}
