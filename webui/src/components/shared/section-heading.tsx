import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h3
      className={cn(
        "text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase",
        className,
      )}
    >
      {children}
    </h3>
  );
}
