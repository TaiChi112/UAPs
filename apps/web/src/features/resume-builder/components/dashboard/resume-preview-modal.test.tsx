import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResumePreviewModal } from "./resume-preview-modal";

import {
  INITIAL_SAVED_RESUMES,
  INITIAL_VAULT_DATA,
} from "@/features/resume-builder/constants/mock-seed";

describe("ResumePreviewModal", () => {
  it("disables the PDF button and shows the loading label while downloading", () => {
    render(
      <ResumePreviewModal
        resume={INITIAL_SAVED_RESUMES[0]}
        db={INITIAL_VAULT_DATA}
        isDownloadingPdf
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDownloadPdf={vi.fn()}
      />,
    );

    const downloadButton = screen.getByRole("button", {
      name: /downloading pdf/i,
    });

    expect(downloadButton).toBeDisabled();
  });
});
