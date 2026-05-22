import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DashboardView } from "./dashboard-view";

import {
  INITIAL_SAVED_RESUMES,
  INITIAL_VAULT_DATA,
} from "@/features/resume-builder/constants/mock-seed";

describe("DashboardView", () => {
  it("renders saved resumes and wires the primary interactions", async () => {
    const user = userEvent.setup();
    const onCreateManual = vi.fn();
    const onCreateAi = vi.fn();
    const onOpenPreview = vi.fn();
    const onClosePreview = vi.fn();
    const onStatusChange = vi.fn();
    const onEdit = vi.fn();
    const onDuplicate = vi.fn();
    const onDelete = vi.fn();
    const onDownloadPdf = vi.fn();

    render(
      <DashboardView
        toastMessage={null}
        resumes={[INITIAL_SAVED_RESUMES[0]]}
        db={INITIAL_VAULT_DATA}
        previewResume={null}
        isDownloadingPdf={false}
        statusColors={{
          Draft: "draft",
          Applied: "applied",
          Interviewing: "interviewing",
        }}
        onCreateManual={onCreateManual}
        onCreateAi={onCreateAi}
        onOpenPreview={onOpenPreview}
        onClosePreview={onClosePreview}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onDownloadPdf={onDownloadPdf}
      />,
    );

    await user.click(screen.getByText("Create Manually"));
    await user.click(screen.getByText("Auto-Tailor with AI"));
    await user.click(screen.getByText(INITIAL_SAVED_RESUMES[0].title));
    await user.click(screen.getByTitle("Edit"));
    await user.click(screen.getByTitle("Duplicate"));
    await user.click(screen.getByTitle("Delete"));
    await user.selectOptions(screen.getByDisplayValue("Applied"), "Interviewing");

    expect(onCreateManual).toHaveBeenCalledTimes(1);
    expect(onCreateAi).toHaveBeenCalledTimes(1);
    expect(onOpenPreview).toHaveBeenCalledWith(INITIAL_SAVED_RESUMES[0]);
    expect(onEdit).toHaveBeenCalledWith(INITIAL_SAVED_RESUMES[0]);
    expect(onDuplicate).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(
      INITIAL_SAVED_RESUMES[0].id,
      expect.any(Object),
    );
    expect(onStatusChange).toHaveBeenCalledWith(
      INITIAL_SAVED_RESUMES[0].id,
      "Interviewing",
      expect.any(Object),
    );

    expect(onClosePreview).not.toHaveBeenCalled();
    expect(onDownloadPdf).not.toHaveBeenCalled();
  });
});
