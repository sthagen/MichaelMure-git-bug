import { cn } from "@/lib/utils";

interface EmptyStateProps {
  children: React.ReactNode;
  className?: string;
}

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <p className={cn("text-muted-foreground px-4 py-8 text-center text-sm", className)}>
      {children}
    </p>
  );
}
