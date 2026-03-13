// REST API client for git repository browsing.
// Endpoints are served by the Go backend under /api/repos/{owner}/{repo}/git/*.
// "_" is the wildcard value for both owner and repo (resolves to local / default).

const BASE = '/api/repos/_/_'

export interface GitRef {
  name: string       // full ref: "refs/heads/main"
  shortName: string  // "main"
  type: 'branch' | 'tag'
  hash: string
  isDefault: boolean
}

export interface GitTreeEntry {
  name: string
  type: 'tree' | 'blob'
  hash: string
  mode: string
  // Last commit touching this entry (may be absent if expensive to compute)
  lastCommit?: {
    hash: string
    shortHash: string
    message: string
    authorName: string
    date: string
  }
}

export interface GitBlob {
  path: string
  content: string   // UTF-8 text; empty string when isBinary is true
  size: number
  isBinary: boolean
}

export interface GitCommit {
  hash: string
  shortHash: string
  message: string
  authorName: string
  authorEmail: string
  date: string
  parents: string[]
}

export interface GitCommitDetail extends GitCommit {
  fullMessage: string
  files: Array<{
    path: string
    oldPath?: string
    status: 'added' | 'modified' | 'deleted' | 'renamed'
  }>
}

export interface DiffLine {
  type: 'context' | 'added' | 'deleted'
  content: string
  oldLine: number
  newLine: number
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

export interface FileDiff {
  path: string
  oldPath?: string
  isBinary: boolean
  isNew: boolean
  isDelete: boolean
  hunks: DiffHunk[]
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const search = new URLSearchParams(params).toString()
  const url = `${BASE}${path}${search ? `?${search}` : ''}`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || res.statusText)
  }
  return res.json()
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function getRefs(): Promise<GitRef[]> {
  return get('/git/refs')
}

export function getTree(ref: string, path: string): Promise<GitTreeEntry[]> {
  return get(`/git/trees/${encodeURIComponent(ref)}`, path ? { path } : {})
}

export function getBlob(ref: string, path: string): Promise<GitBlob> {
  return get(`/git/blobs/${encodeURIComponent(ref)}`, { path })
}

export function getRawUrl(ref: string, path: string): string {
  return `${BASE}/git/raw/${encodeURIComponent(ref)}/${path}`
}

export function getCommits(
  ref: string,
  opts: { path?: string; limit?: number; after?: string } = {},
): Promise<GitCommit[]> {
  const params: Record<string, string> = { ref, limit: String(opts.limit ?? 20) }
  if (opts.path) params.path = opts.path
  if (opts.after) params.after = opts.after
  return get('/git/commits', params)
}

export function getCommit(sha: string): Promise<GitCommitDetail> {
  return get(`/git/commits/${sha}`)
}

export function getCommitDiff(sha: string, path: string): Promise<FileDiff> {
  return get(`/git/commits/${sha}/diff`, { path })
}
