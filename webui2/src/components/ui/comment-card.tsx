import type { IdentitySummaryFragment } from "@/__generated__/graphql";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface RootProps {
  children: React.ReactNode;
  className?: string;
}

export function Root({ children, className }: RootProps) {
  return <div className={cn("flex gap-3", className)}>{children}</div>;
}

type AuthorAvatarProps = Pick<IdentitySummaryFragment, "displayName" | "avatarUrl"> & {
  className?: string;
};

export function AuthorAvatar({ avatarUrl, displayName, className }: AuthorAvatarProps) {
  return (
    <Avatar className={cn("mt-1 size-8 shrink-0", className)}>
      <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
      <AvatarFallback className="text-xs">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("border-border min-w-0 flex-1 rounded-md border", className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/40 flex items-center gap-2 border-b px-4 py-2 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}
