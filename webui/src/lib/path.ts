// Repository path helpers. Paths are forward-slash separated and relative to
// the repo root with no leading slash; the root itself is "".

// Directory containing `path`, or "" when `path` is at the repo root.
// Note: unlike Node's path.dirname, the root is "" rather than ".".
export function dirname(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
}
