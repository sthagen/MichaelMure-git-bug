import { useFragment, type FragmentType } from "@/__generated__/fragment-masking";
import { graphql } from "@/__generated__/gql";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const IDENTITY_SUMMARY_FRAGMENT = graphql(`
  fragment IdentitySummary on Identity {
    id
    humanId
    displayName
    avatarUrl
  }
`);

interface RootProps {
  children: React.ReactNode;
  className?: string;
}

export function Root({ children, className }: RootProps) {
  return <div className={cn("flex gap-3", className)}>{children}</div>;
}

interface AuthorAvatarProps {
  author: FragmentType<typeof IDENTITY_SUMMARY_FRAGMENT>;
  className?: string;
}

export function AuthorAvatar({ author, className }: AuthorAvatarProps) {
  const data = useFragment(IDENTITY_SUMMARY_FRAGMENT, author);

  return (
    <Avatar className={cn("mt-1 size-8 shrink-0", className)}>
      <AvatarImage src={data.avatarUrl ?? undefined} alt={data.displayName} />
      <AvatarFallback className="text-xs">
        {data.displayName.slice(0, 2).toUpperCase()}
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
