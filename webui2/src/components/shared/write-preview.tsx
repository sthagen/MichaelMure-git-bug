import { createContext, useContext, useState } from "react";

import { cn } from "@/lib/utils";

interface WritePreviewContextValue {
  preview: boolean;
  setPreview: (v: boolean) => void;
  hasContent: boolean;
}

const WritePreviewContext = createContext<WritePreviewContextValue | null>(null);

function useWritePreview() {
  const ctx = useContext(WritePreviewContext);
  if (!ctx) throw new Error("WritePreview sub-components must be used within WritePreview.Root");
  return ctx;
}

interface RootProps {
  children: React.ReactNode;
  className?: string;
  hasContent?: boolean;
  /** Controlled mode: current preview state. */
  preview?: boolean;
  /** Controlled mode: callback when preview state changes. */
  onPreviewChange?: (v: boolean) => void;
}

export function Root({ children, className, hasContent = false, preview, onPreviewChange }: RootProps) {
  const [internalPreview, setInternalPreview] = useState(false);
  const isControlled = preview !== undefined;

  const value: WritePreviewContextValue = {
    preview: isControlled ? preview : internalPreview,
    setPreview: isControlled ? (onPreviewChange ?? (() => {})) : setInternalPreview,
    hasContent,
  };

  return (
    <WritePreviewContext value={value}>
      <div className={className}>{children}</div>
    </WritePreviewContext>
  );
}

interface TabsProps {
  className?: string;
}

export function Tabs({ className }: TabsProps) {
  const { preview, setPreview, hasContent } = useWritePreview();

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={() => setPreview(false)}
        className={cn(
          "rounded-sm px-2 py-0.5 text-sm font-medium transition-colors",
          !preview ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Write
      </button>
      <button
        type="button"
        onClick={() => setPreview(true)}
        disabled={!hasContent}
        className={cn(
          "rounded-sm px-2 py-0.5 text-sm font-medium transition-colors disabled:opacity-40",
          preview ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Preview
      </button>
    </div>
  );
}

interface SlotProps {
  children: React.ReactNode;
}

export function WriteSlot({ children }: SlotProps) {
  const { preview } = useWritePreview();
  if (preview) return null;
  return <>{children}</>;
}

export function PreviewSlot({ children }: SlotProps) {
  const { preview } = useWritePreview();
  if (!preview) return null;
  return <>{children}</>;
}
