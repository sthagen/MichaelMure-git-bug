// Interaction tests for write-preview.tsx.
// Covers tab switching, disabled state, slot visibility, and controlled mode.

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Root, Tabs, WriteSlot, PreviewSlot } from "./write-preview";

// ── Test harness ──────────────────────────────────────────────────────────────

function Harness({
  hasContent = false,
  preview,
  onPreviewChange,
}: {
  hasContent?: boolean;
  preview?: boolean;
  onPreviewChange?: (v: boolean) => void;
}) {
  return (
    <Root hasContent={hasContent} preview={preview} onPreviewChange={onPreviewChange}>
      <Tabs />
      <WriteSlot><span>write content</span></WriteSlot>
      <PreviewSlot><span>preview content</span></PreviewSlot>
    </Root>
  );
}

// ── Tab rendering ─────────────────────────────────────────────────────────────

describe("WritePreview — tab rendering", () => {
  it("shows both Write and Preview tabs", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
  });

  it("disables the Preview tab when hasContent is false", () => {
    render(<Harness hasContent={false} />);
    expect(screen.getByRole("button", { name: "Preview" })).toBeDisabled();
  });

  it("enables the Preview tab when hasContent is true", () => {
    render(<Harness hasContent={true} />);
    expect(screen.getByRole("button", { name: "Preview" })).not.toBeDisabled();
  });
});

// ── Slot visibility ───────────────────────────────────────────────────────────

describe("WritePreview — slot visibility", () => {
  it("shows WriteSlot and hides PreviewSlot by default", () => {
    render(<Harness />);
    expect(screen.getByText("write content")).toBeInTheDocument();
    expect(screen.queryByText("preview content")).toBeNull();
  });

  it("hides WriteSlot and shows PreviewSlot after clicking Preview", () => {
    render(<Harness hasContent={true} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.queryByText("write content")).toBeNull();
    expect(screen.getByText("preview content")).toBeInTheDocument();
  });

  it("restores WriteSlot after clicking Write from Preview mode", () => {
    render(<Harness hasContent={true} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    fireEvent.click(screen.getByRole("button", { name: "Write" }));
    expect(screen.getByText("write content")).toBeInTheDocument();
    expect(screen.queryByText("preview content")).toBeNull();
  });
});

// ── Controlled mode ───────────────────────────────────────────────────────────

describe("WritePreview — controlled mode", () => {
  it("shows PreviewSlot when preview=true is passed as prop", () => {
    render(<Harness preview={true} onPreviewChange={vi.fn()} />);
    expect(screen.queryByText("write content")).toBeNull();
    expect(screen.getByText("preview content")).toBeInTheDocument();
  });

  it("shows WriteSlot when preview=false is passed as prop", () => {
    render(<Harness preview={false} onPreviewChange={vi.fn()} />);
    expect(screen.getByText("write content")).toBeInTheDocument();
    expect(screen.queryByText("preview content")).toBeNull();
  });

  it("calls onPreviewChange(true) when Preview tab is clicked", () => {
    const onPreviewChange = vi.fn();
    render(<Harness preview={false} onPreviewChange={onPreviewChange} hasContent={true} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(onPreviewChange).toHaveBeenCalledWith(true);
  });

  it("calls onPreviewChange(false) when Write tab is clicked in preview mode", () => {
    const onPreviewChange = vi.fn();
    render(<Harness preview={true} onPreviewChange={onPreviewChange} hasContent={true} />);
    fireEvent.click(screen.getByRole("button", { name: "Write" }));
    expect(onPreviewChange).toHaveBeenCalledWith(false);
  });

  it("does not crash when controlled without an onPreviewChange callback", () => {
    // preview is controlled but no callback provided — tab clicks are no-ops
    render(<Harness preview={false} hasContent={true} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    // state is still driven by the prop — WriteSlot remains visible
    expect(screen.getByText("write content")).toBeInTheDocument();
  });
});
