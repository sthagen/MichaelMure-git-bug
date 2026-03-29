import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

// Sanitization schema: start from the safe default and allow a small set of
// presentational/structural HTML tags commonly found in READMEs.
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "details", "summary", "picture", "source"],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "aria-hidden", "class"],
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"],
  },
};

export interface RepoContext {
  repo: string;
  ref: string;
  /** Directory containing the markdown file (e.g. "doc" for doc/README.md). */
  basePath: string;
}

interface MarkdownProps {
  content: string;
  className?: string;
  /** When set, relative links/images are resolved against the repo. */
  repoContext?: RepoContext;
}

function isRelativeUrl(url: string): boolean {
  return !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|data:)/i.test(url);
}

function resolveRelativePath(basePath: string, relativePath: string): string {
  const parts = basePath ? basePath.split("/") : [];
  for (const segment of relativePath.split("/")) {
    if (segment === "..") {
      parts.pop();
    } else if (segment !== "." && segment !== "") {
      parts.push(segment);
    }
  }
  return parts.join("/");
}

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "avif",
  "ico",
  "bmp",
]);

function isImagePath(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(ext);
}

// Renders a Markdown string with GitHub-flavoured extensions (tables, task
// lists, strikethrough). Used in Timeline comments and code browser READMEs.
export function Markdown({ content, className, repoContext }: MarkdownProps) {
  // Rewrite relative URLs:
  //   - images → /gitraw/{repo}/{ref}/{path} (serves raw bytes)
  //   - links  → /{repo}/blob/{ref}/{path}   (code browser view)
  const urlTransform = useMemo(() => {
    if (!repoContext) return undefined;
    const { repo, ref, basePath } = repoContext;
    return (url: string) => {
      if (!isRelativeUrl(url)) return url;
      const resolved = resolveRelativePath(basePath, url);
      if (isImagePath(resolved)) {
        return `/gitraw/${repo}/${ref}/${resolved}`;
      }
      return `/${repo}/blob/${ref}/${resolved}`;
    };
  }, [repoContext]);

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-pre:bg-muted prose-pre:text-foreground",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        "prose-img:inline prose-img:my-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
        ]}
        urlTransform={urlTransform}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
