import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { PluggableList } from "unified";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import type { HighlighterCore } from "shiki/core";

import { getHighlighter, SHIKI_THEMES } from "@/lib/shiki";
import { cn } from "@/lib/utils";

// Sanitization schema: start from the safe default and allow a small set of
// presentational/structural HTML tags commonly found in READMEs.
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "details", "summary", "picture", "source"],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "aria-hidden", "class"],
    // Allow Shiki's style attribute (CSS variables for theme colors) and class on code/spans
    pre: [...(defaultSchema.attributes?.pre ?? []), "class", "style", "tabIndex"],
    code: [...(defaultSchema.attributes?.code ?? []), "class", "style"],
    span: [...(defaultSchema.attributes?.span ?? []), "class", "style"],
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
function useShikiHighlighter(): HighlighterCore | null {
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getHighlighter().then((h) => {
      if (!cancelled) setHighlighter(h);
    });
    return () => { cancelled = true; };
  }, []);
  return highlighter;
}

export function Markdown({ content, className, repoContext }: MarkdownProps) {
  const highlighter = useShikiHighlighter();

  // Rewrite image src to /gitfile for raw content serving.
  // Links are handled by the custom `a` component below.
  const urlTransform = useMemo(() => {
    if (!repoContext) return undefined;
    const { repo, ref, basePath } = repoContext;
    return (url: string) => {
      if (!isRelativeUrl(url)) return url;
      const resolved = resolveRelativePath(basePath, url);
      if (isImagePath(resolved)) {
        return `/gitfile/${repo}/${ref}/${resolved}`;
      }
      // Non-image relative URLs are handled by the `a` component override,
      // but urlTransform runs first, so we still need to return something.
      // Return the resolved path prefixed so the `a` component can detect it.
      return `/${repo}/blob/${ref}/${resolved}`;
    };
  }, [repoContext]);

  const components = useMemo(() => {
    if (!repoContext) return undefined;
    const { repo, ref, basePath } = repoContext;
    const gitfilePrefix = `/gitfile/${repo}/${ref}/`;
    return {
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        // Wrap repo-local images in a Link to the blob view
        if (src?.startsWith(gitfilePrefix)) {
          const path = src.slice(gitfilePrefix.length);
          return (
            <Link to="/$repo/blob/$ref/$" params={{ repo, ref, _splat: path }}>
              <img src={src} alt={alt} {...props} />
            </Link>
          );
        }
        return <img src={src} alt={alt} {...props} />;
      },
      a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        if (!href) return <a {...props}>{children}</a>;

        // Anchor links stay as-is
        if (href.startsWith("#"))
          return (
            <a href={href} {...props}>
              {children}
            </a>
          );

        // Check if this is a relative URL that we should route client-side.
        // After urlTransform, repo-local links look like /{repo}/blob/{ref}/{path}
        const prefix = `/${repo}/blob/${ref}/`;
        if (href.startsWith(prefix)) {
          const path = href.slice(prefix.length);
          return (
            <Link to="/$repo/blob/$ref/$" params={{ repo, ref, _splat: path }} {...props}>
              {children}
            </Link>
          );
        }

        // Also handle raw relative URLs that urlTransform didn't process
        // (shouldn't happen but defensive)
        if (isRelativeUrl(href)) {
          const resolved = resolveRelativePath(basePath, href);
          return (
            <Link to="/$repo/blob/$ref/$" params={{ repo, ref, _splat: resolved }} {...props}>
              {children}
            </Link>
          );
        }

        // External links — render as normal anchor
        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    };
  }, [repoContext]);

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // Code blocks: border, rounded corners, fallback bg for non-highlighted blocks.
        // Shiki adds .shiki class which overrides the background via CSS in index.css.
        "prose-pre:rounded-md prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:text-foreground prose-pre:text-sm prose-pre:overflow-x-auto",
        // Inline code: muted background pill
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        // Reset inline code styles inside highlighted code blocks
        "prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0",
        "prose-img:inline prose-img:my-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          ...(highlighter
            ? [[rehypeShikiFromHighlighter, highlighter, { themes: SHIKI_THEMES, defaultColor: false }] as PluggableList[number]]
            : []),
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
        ]}
        urlTransform={urlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
