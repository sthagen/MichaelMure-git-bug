/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  CombinedId: { input: string; output: string; }
  Hash: { input: string; output: string; }
  Time: { input: string; output: string; }
};

/** An object that has an author. */
export type Authored = {
  /** The author of this object. */
  author: Identity;
};

export type Bug = Authored & Entity & {
  __typename: 'Bug';
  /** The actors of the bug. Actors are Identity that have interacted with the bug. */
  actors: IdentityConnection;
  author: Identity;
  comments: BugCommentConnection;
  createdAt: Scalars['Time']['output'];
  /** The human version (truncated) identifier for this bug */
  humanId: Scalars['String']['output'];
  /** The identifier for this bug */
  id: Scalars['ID']['output'];
  labels: Array<Label>;
  lastEdit: Scalars['Time']['output'];
  operations: OperationConnection;
  /**
   * The participants of the bug. Participants are Identity that have created or
   * added a comment on the bug.
   */
  participants: IdentityConnection;
  status: Status;
  timeline: BugTimelineItemConnection;
  title: Scalars['String']['output'];
};


export type BugActorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type BugCommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type BugOperationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type BugParticipantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type BugTimelineArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type BugAddCommentAndCloseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The collection of file's hash required for the first message. */
  files?: InputMaybe<Array<Scalars['Hash']['input']>>;
  /** The message to be added to the bug. */
  message: Scalars['String']['input'];
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugAddCommentAndClosePayload = {
  __typename: 'BugAddCommentAndClosePayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting AddComment operation. */
  commentOperation: BugAddCommentOperation;
  /** The resulting SetStatusOperation. */
  statusOperation: BugSetStatusOperation;
};

export type BugAddCommentAndReopenInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The collection of file's hash required for the first message. */
  files?: InputMaybe<Array<Scalars['Hash']['input']>>;
  /** The message to be added to the bug. */
  message: Scalars['String']['input'];
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugAddCommentAndReopenPayload = {
  __typename: 'BugAddCommentAndReopenPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting AddComment operation. */
  commentOperation: BugAddCommentOperation;
  /** The resulting SetStatusOperation. */
  statusOperation: BugSetStatusOperation;
};

export type BugAddCommentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The collection of file's hash required for the first message. */
  files?: InputMaybe<Array<Scalars['Hash']['input']>>;
  /** The message to be added to the bug. */
  message: Scalars['String']['input'];
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugAddCommentOperation = Authored & Operation & {
  __typename: 'BugAddCommentOperation';
  /** The author of this object. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  files: Array<Scalars['Hash']['output']>;
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
};

export type BugAddCommentPayload = {
  __typename: 'BugAddCommentPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugAddCommentOperation;
};

/** BugAddCommentTimelineItem is a BugTimelineItem that represent a BugComment and its edition history */
export type BugAddCommentTimelineItem = Authored & BugTimelineItem & {
  __typename: 'BugAddCommentTimelineItem';
  author: Identity;
  createdAt: Scalars['Time']['output'];
  edited: Scalars['Boolean']['output'];
  files: Array<Scalars['Hash']['output']>;
  history: Array<BugCommentHistoryStep>;
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
  lastEdit: Scalars['Time']['output'];
  message: Scalars['String']['output'];
  messageIsEmpty: Scalars['Boolean']['output'];
};

export type BugChangeLabelInput = {
  /** The list of label to remove. */
  Removed?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The list of label to add. */
  added?: InputMaybe<Array<Scalars['String']['input']>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugChangeLabelPayload = {
  __typename: 'BugChangeLabelPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugLabelChangeOperation;
  /** The effect each source label had. */
  results: Array<Maybe<LabelChangeResult>>;
};

/** Represents a comment on a bug. */
export type BugComment = Authored & {
  __typename: 'BugComment';
  /** The author of this comment. */
  author: Identity;
  /** All media's hash referenced in this comment */
  files: Array<Scalars['Hash']['output']>;
  id: Scalars['CombinedId']['output'];
  /** The message of this comment. */
  message: Scalars['String']['output'];
};

export type BugCommentConnection = {
  __typename: 'BugCommentConnection';
  edges: Array<BugCommentEdge>;
  nodes: Array<BugComment>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BugCommentEdge = {
  __typename: 'BugCommentEdge';
  cursor: Scalars['String']['output'];
  node: BugComment;
};

/** CommentHistoryStep hold one version of a message in the history */
export type BugCommentHistoryStep = {
  __typename: 'BugCommentHistoryStep';
  date: Scalars['Time']['output'];
  message: Scalars['String']['output'];
};

/** The connection type for Bug. */
export type BugConnection = {
  __typename: 'BugConnection';
  /** A list of edges. */
  edges: Array<BugEdge>;
  nodes: Array<Bug>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type BugCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The collection of file's hash required for the first message. */
  files?: InputMaybe<Array<Scalars['Hash']['input']>>;
  /** The first message of the new bug. */
  message: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
  /** The title of the new bug. */
  title: Scalars['String']['input'];
};

export type BugCreateOperation = Authored & Operation & {
  __typename: 'BugCreateOperation';
  /** The author of this object. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  files: Array<Scalars['Hash']['output']>;
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type BugCreatePayload = {
  __typename: 'BugCreatePayload';
  /** The created bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugCreateOperation;
};

/** BugCreateTimelineItem is a BugTimelineItem that represent the creation of a bug and its message edition history */
export type BugCreateTimelineItem = Authored & BugTimelineItem & {
  __typename: 'BugCreateTimelineItem';
  author: Identity;
  createdAt: Scalars['Time']['output'];
  edited: Scalars['Boolean']['output'];
  files: Array<Scalars['Hash']['output']>;
  history: Array<BugCommentHistoryStep>;
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
  lastEdit: Scalars['Time']['output'];
  message: Scalars['String']['output'];
  messageIsEmpty: Scalars['Boolean']['output'];
};

/** An edge in a connection. */
export type BugEdge = {
  __typename: 'BugEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Bug;
};

export type BugEditCommentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The collection of file's hash required for the first message. */
  files?: InputMaybe<Array<Scalars['Hash']['input']>>;
  /** The new message to be set. */
  message: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
  /** A prefix of the CombinedId of the comment to be changed. */
  targetPrefix: Scalars['String']['input'];
};

export type BugEditCommentOperation = Authored & Operation & {
  __typename: 'BugEditCommentOperation';
  /** The author of this object. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  files: Array<Scalars['Hash']['output']>;
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  target: Scalars['String']['output'];
};

export type BugEditCommentPayload = {
  __typename: 'BugEditCommentPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugEditCommentOperation;
};

export type BugEvent = {
  __typename: 'BugEvent';
  bug: Bug;
  type: EntityEventType;
};

export type BugLabelChangeOperation = Authored & Operation & {
  __typename: 'BugLabelChangeOperation';
  added: Array<Label>;
  /** The author of this object. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
  removed: Array<Label>;
};

/** BugLabelChangeTimelineItem is a BugTimelineItem that represent a change in the labels of a bug */
export type BugLabelChangeTimelineItem = Authored & BugTimelineItem & {
  __typename: 'BugLabelChangeTimelineItem';
  added: Array<Label>;
  author: Identity;
  date: Scalars['Time']['output'];
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
  removed: Array<Label>;
};

export type BugSetStatusOperation = Authored & Operation & {
  __typename: 'BugSetStatusOperation';
  /** The author of this object. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
  status: Status;
};

/** BugSetStatusTimelineItem is a BugTimelineItem that represent a change in the status of a bug */
export type BugSetStatusTimelineItem = Authored & BugTimelineItem & {
  __typename: 'BugSetStatusTimelineItem';
  author: Identity;
  date: Scalars['Time']['output'];
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
  status: Status;
};

export type BugSetTitleInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
  /** The new title. */
  title: Scalars['String']['input'];
};

export type BugSetTitleOperation = Authored & Operation & {
  __typename: 'BugSetTitleOperation';
  /** The author of this object. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  was: Scalars['String']['output'];
};

export type BugSetTitlePayload = {
  __typename: 'BugSetTitlePayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation */
  operation: BugSetTitleOperation;
};

/** BugLabelChangeTimelineItem is a BugTimelineItem that represent a change in the title of a bug */
export type BugSetTitleTimelineItem = Authored & BugTimelineItem & {
  __typename: 'BugSetTitleTimelineItem';
  author: Identity;
  date: Scalars['Time']['output'];
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
  title: Scalars['String']['output'];
  was: Scalars['String']['output'];
};

export type BugStatusCloseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugStatusClosePayload = {
  __typename: 'BugStatusClosePayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugSetStatusOperation;
};

export type BugStatusOpenInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The bug ID's prefix. */
  prefix: Scalars['String']['input'];
  /** The name of the repository. If not set, the default repository is used. */
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugStatusOpenPayload = {
  __typename: 'BugStatusOpenPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugSetStatusOperation;
};

/** An item in the timeline of bug events */
export type BugTimelineItem = {
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
};

/** The connection type for TimelineItem */
export type BugTimelineItemConnection = {
  __typename: 'BugTimelineItemConnection';
  edges: Array<BugTimelineItemEdge>;
  nodes: Array<BugTimelineItem>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Represent a TimelineItem */
export type BugTimelineItemEdge = {
  __typename: 'BugTimelineItemEdge';
  cursor: Scalars['String']['output'];
  node: BugTimelineItem;
};

/** Defines a color by red, green and blue components. */
export type Color = {
  __typename: 'Color';
  /** Blue component of the color. */
  B: Scalars['Int']['output'];
  /** Green component of the color. */
  G: Scalars['Int']['output'];
  /** Red component of the color. */
  R: Scalars['Int']['output'];
};

/** An entity (identity, bug, ...). */
export type Entity = {
  /** The human version (truncated) identifier for this entity */
  humanId: Scalars['String']['output'];
  /** The identifier for this entity */
  id: Scalars['ID']['output'];
};

export type EntityEvent = {
  __typename: 'EntityEvent';
  entity: Maybe<Entity>;
  type: EntityEventType;
};

export enum EntityEventType {
  Created = 'CREATED',
  Removed = 'REMOVED',
  Updated = 'UPDATED'
}

/** The content of a git blob (file). */
export type GitBlob = {
  __typename: 'GitBlob';
  /**
   * Git object hash. Can be used as a stable cache key or to construct a
   * raw download URL.
   */
  hash: Scalars['String']['output'];
  /**
   * True when the file contains null bytes and is treated as binary.
   * text will be null.
   */
  isBinary: Scalars['Boolean']['output'];
  /**
   * True when the file exceeds the maximum inline size and text has been
   * omitted. Use the raw download endpoint to retrieve the full content.
   */
  isTruncated: Scalars['Boolean']['output'];
  /** Path of the file relative to the repository root. */
  path: Scalars['String']['output'];
  /** Size in bytes. */
  size: Scalars['Int']['output'];
  /**
   * UTF-8 text content of the file. Null when isBinary is true or when
   * the file is too large to be returned inline (see isTruncated).
   */
  text: Maybe<Scalars['String']['output']>;
};

/** How a file was affected by a commit. */
export enum GitChangeStatus {
  /** File was created in this commit. */
  Added = 'ADDED',
  /** File was removed in this commit. */
  Deleted = 'DELETED',
  /** File content changed in this commit. */
  Modified = 'MODIFIED',
  /** File was moved or renamed in this commit. */
  Renamed = 'RENAMED'
}

/** A file that was changed in a commit. */
export type GitChangedFile = {
  __typename: 'GitChangedFile';
  /** Previous path, non-null only for renames. */
  oldPath: Maybe<Scalars['String']['output']>;
  /** Path of the file in the new version of the commit. */
  path: Scalars['String']['output'];
  /** How the file was affected by the commit. */
  status: GitChangeStatus;
};

export type GitChangedFileConnection = {
  __typename: 'GitChangedFileConnection';
  nodes: Array<GitChangedFile>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Metadata for a single git commit. */
export type GitCommit = {
  __typename: 'GitCommit';
  /** Email address of the commit author. */
  authorEmail: Scalars['String']['output'];
  /** Name of the commit author. */
  authorName: Scalars['String']['output'];
  /** Timestamp from the author field (when the change was originally made). */
  date: Scalars['Time']['output'];
  /** Unified diff for a single file in this commit. */
  diff: Maybe<GitFileDiff>;
  /**
   * Files changed relative to the first parent (or the empty tree for the
   * initial commit).
   */
  files: GitChangedFileConnection;
  /** Full commit message. */
  fullMessage: Scalars['String']['output'];
  /** Full SHA-1 commit hash. */
  hash: Scalars['String']['output'];
  /** First line of the commit message. */
  message: Scalars['String']['output'];
  /** Hashes of parent commits. Empty for the initial commit. */
  parents: Array<Scalars['String']['output']>;
  /** Abbreviated commit hash, typically 8 characters. */
  shortHash: Scalars['String']['output'];
};


/** Metadata for a single git commit. */
export type GitCommitDiffArgs = {
  path: Scalars['String']['input'];
};


/** Metadata for a single git commit. */
export type GitCommitFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Paginated list of commits. */
export type GitCommitConnection = {
  __typename: 'GitCommitConnection';
  nodes: Array<GitCommit>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A contiguous block of changes in a unified diff. */
export type GitDiffHunk = {
  __typename: 'GitDiffHunk';
  /** Lines in this hunk, including context, additions, and deletions. */
  lines: Array<GitDiffLine>;
  /** Number of lines from the new file included in this hunk. */
  newLines: Scalars['Int']['output'];
  /** Starting line number in the new file. */
  newStart: Scalars['Int']['output'];
  /** Number of lines from the old file included in this hunk. */
  oldLines: Scalars['Int']['output'];
  /** Starting line number in the old file. */
  oldStart: Scalars['Int']['output'];
};

/** A single line in a unified diff hunk. */
export type GitDiffLine = {
  __typename: 'GitDiffLine';
  /** Raw line content, without the leading +/- prefix. */
  content: Scalars['String']['output'];
  /** Line number in the new file. 0 for deleted lines. */
  newLine: Scalars['Int']['output'];
  /** Line number in the old file. 0 for added lines. */
  oldLine: Scalars['Int']['output'];
  /** Whether this line is context, an addition, or a deletion. */
  type: GitDiffLineType;
};

/** The role of a line within a unified diff hunk. */
export enum GitDiffLineType {
  /** A line added in the new version. */
  Added = 'ADDED',
  /** An unchanged line present in both old and new versions. */
  Context = 'CONTEXT',
  /** A line removed from the old version. */
  Deleted = 'DELETED'
}

/** The diff for a single file in a commit. */
export type GitFileDiff = {
  __typename: 'GitFileDiff';
  /** Contiguous blocks of changes. Empty for binary files. */
  hunks: Array<GitDiffHunk>;
  /** True when the file is binary and no textual diff is available. */
  isBinary: Scalars['Boolean']['output'];
  /** True when the file was deleted in this commit. */
  isDelete: Scalars['Boolean']['output'];
  /** True when the file was created in this commit. */
  isNew: Scalars['Boolean']['output'];
  /** Previous path, non-null only for renames. */
  oldPath: Maybe<Scalars['String']['output']>;
  /** Path of the file in the new version. */
  path: Scalars['String']['output'];
};

/** The last commit that touched each requested entry in a directory. */
export type GitLastCommit = {
  __typename: 'GitLastCommit';
  /** Most recent commit that modified this entry. */
  commit: GitCommit;
  /** Entry name within the directory. */
  name: Scalars['String']['output'];
};

/** The type of object a git tree entry points to. */
export enum GitObjectType {
  /** A regular or executable file. */
  Blob = 'BLOB',
  /** A git submodule. */
  Submodule = 'SUBMODULE',
  /** A symbolic link. */
  Symlink = 'SYMLINK',
  /** A directory. */
  Tree = 'TREE'
}

/** A git branch or tag reference. */
export type GitRef = {
  __typename: 'GitRef';
  /** Git commit the reference points to. */
  commit: GitCommit;
  /** Commit hash the reference points to. */
  hash: Scalars['String']['output'];
  /** Full reference name, e.g. refs/heads/main or refs/tags/v1.0. */
  name: Scalars['String']['output'];
  /** Short name, e.g. main or v1.0. */
  shortName: Scalars['String']['output'];
  /** Whether this reference is a branch or a tag. */
  type: GitRefType;
};

export type GitRefConnection = {
  __typename: 'GitRefConnection';
  nodes: Array<GitRef>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** The kind of git reference: a branch, a tag, or a detached commit. */
export enum GitRefType {
  /** A local branch (refs/heads/*). */
  Branch = 'BRANCH',
  /** A detached HEAD pointing directly at a commit. */
  Commit = 'COMMIT',
  /** An annotated or lightweight tag (refs/tags/*). */
  Tag = 'TAG'
}

/** An entry in a git tree (directory listing). */
export type GitTreeEntry = {
  __typename: 'GitTreeEntry';
  /** Git object hash. */
  hash: Scalars['String']['output'];
  /**
   * The last git commit that touched this tree entry. Null when the entry
   * cannot be resolved within the history depth limit.
   */
  lastCommit: Maybe<GitCommit>;
  /** File or directory name within the parent tree. */
  name: Scalars['String']['output'];
  /** Whether this entry is a file, directory, symlink, or submodule. */
  type: GitObjectType;
};

/** Represents an identity */
export type Identity = Entity & {
  __typename: 'Identity';
  /** An url to an avatar */
  avatarUrl: Maybe<Scalars['String']['output']>;
  /** A non-empty string to display, representing the identity, based on the non-empty values. */
  displayName: Scalars['String']['output'];
  /** The email of the person, if known. */
  email: Maybe<Scalars['String']['output']>;
  /** The human version (truncated) identifier for this identity */
  humanId: Scalars['String']['output'];
  /** The identifier for this identity */
  id: Scalars['ID']['output'];
  /**
   * isProtected is true if the chain of git commits started to be signed.
   * If that's the case, only signed commit with a valid key for this identity can be added.
   */
  isProtected: Scalars['Boolean']['output'];
  /** The login of the person, if known. */
  login: Maybe<Scalars['String']['output']>;
  /** The name of the person, if known. */
  name: Maybe<Scalars['String']['output']>;
};

export type IdentityConnection = {
  __typename: 'IdentityConnection';
  edges: Array<IdentityEdge>;
  nodes: Array<Identity>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdentityEdge = {
  __typename: 'IdentityEdge';
  cursor: Scalars['String']['output'];
  node: Identity;
};

export type IdentityEvent = {
  __typename: 'IdentityEvent';
  identity: Identity;
  type: EntityEventType;
};

/** Label for a bug. */
export type Label = {
  __typename: 'Label';
  /** Color of the label. */
  color: Color;
  /** The name of the label. */
  name: Scalars['String']['output'];
};

export type LabelChangeResult = {
  __typename: 'LabelChangeResult';
  /** The source label. */
  label: Label;
  /** The effect this label had. */
  status: LabelChangeStatus;
};

export enum LabelChangeStatus {
  Added = 'ADDED',
  AlreadySet = 'ALREADY_SET',
  DoesntExist = 'DOESNT_EXIST',
  DuplicateInOp = 'DUPLICATE_IN_OP',
  Removed = 'REMOVED'
}

export type LabelConnection = {
  __typename: 'LabelConnection';
  edges: Array<LabelEdge>;
  nodes: Array<Label>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type LabelEdge = {
  __typename: 'LabelEdge';
  cursor: Scalars['String']['output'];
  node: Label;
};

export type Mutation = {
  __typename: 'Mutation';
  /** Add a new comment to a bug */
  bugAddComment: BugAddCommentPayload;
  /** Add a new comment to a bug and close it */
  bugAddCommentAndClose: BugAddCommentAndClosePayload;
  /** Add a new comment to a bug and reopen it */
  bugAddCommentAndReopen: BugAddCommentAndReopenPayload;
  /** Add or remove a set of label on a bug */
  bugChangeLabels: BugChangeLabelPayload;
  /** Create a new bug */
  bugCreate: BugCreatePayload;
  /** Change a comment of a bug */
  bugEditComment: BugEditCommentPayload;
  /** Change a bug's title */
  bugSetTitle: BugSetTitlePayload;
  /** Change a bug's status to closed */
  bugStatusClose: BugStatusClosePayload;
  /** Change a bug's status to open */
  bugStatusOpen: BugStatusOpenPayload;
};


export type MutationBugAddCommentArgs = {
  input: BugAddCommentInput;
};


export type MutationBugAddCommentAndCloseArgs = {
  input: BugAddCommentAndCloseInput;
};


export type MutationBugAddCommentAndReopenArgs = {
  input: BugAddCommentAndReopenInput;
};


export type MutationBugChangeLabelsArgs = {
  input?: InputMaybe<BugChangeLabelInput>;
};


export type MutationBugCreateArgs = {
  input: BugCreateInput;
};


export type MutationBugEditCommentArgs = {
  input: BugEditCommentInput;
};


export type MutationBugSetTitleArgs = {
  input: BugSetTitleInput;
};


export type MutationBugStatusCloseArgs = {
  input: BugStatusCloseInput;
};


export type MutationBugStatusOpenArgs = {
  input: BugStatusOpenInput;
};

/** An operation applied to an entity. */
export type Operation = {
  /** The operations author. */
  author: Identity;
  /** The datetime when this operation was issued. */
  date: Scalars['Time']['output'];
  /** The identifier of the operation */
  id: Scalars['ID']['output'];
};

/** The connection type for an Operation */
export type OperationConnection = {
  __typename: 'OperationConnection';
  edges: Array<OperationEdge>;
  nodes: Array<Operation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Represent an Operation */
export type OperationEdge = {
  __typename: 'OperationEdge';
  cursor: Scalars['String']['output'];
  node: Operation;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor: Scalars['String']['output'];
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor: Scalars['String']['output'];
};

export type Query = {
  __typename: 'Query';
  /** List all registered repositories. */
  repositories: RepositoryConnection;
  /**
   * Access a repository by reference/name. If no ref is given, the default repository is returned if any.
   * Returns null if the referenced repository does not exist.
   */
  repository: Maybe<Repository>;
};


export type QueryRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRepositoryArgs = {
  ref?: InputMaybe<Scalars['String']['input']>;
};

export type Repository = {
  __typename: 'Repository';
  /** All the bugs */
  allBugs: BugConnection;
  /** All the identities */
  allIdentities: IdentityConnection;
  /**
   * Content of the file at path under ref. Null if the path does not exist
   * or resolves to a tree rather than a blob.
   */
  blob: Maybe<GitBlob>;
  /** Look up a bug by id prefix. Returns null if no bug matches the prefix. */
  bug: Maybe<Bug>;
  /** A single commit by hash. Returns null if the hash does not exist in the repository. */
  commit: Maybe<GitCommit>;
  /**
   * Paginated commit log reachable from ref, optionally filtered to commits
   * touching path.
   */
  commits: GitCommitConnection;
  /**
   * The reference pointed to by HEAD in the git repository.
   * Null if HEAD cannot be resolved, for example in an empty or unborn
   * repository, or if HEAD is missing or invalid.
   */
  head: Maybe<GitRef>;
  /** Look up an identity by id prefix. Returns null if no identity matches the prefix. */
  identity: Maybe<Identity>;
  /**
   * The most recent commit that touched each of the named entries in the
   * directory at path under ref. Use this to populate last-commit info on a
   * tree listing without blocking the initial tree fetch.
   */
  lastCommits: Array<GitLastCommit>;
  /** The name of the repository. Null for the default (unnamed) repository in a single-repo setup. */
  name: Maybe<Scalars['String']['output']>;
  /**
   * All branches and tags, optionally filtered by type. BRANCH and TAG are
   * the only accepted filter values; passing COMMIT returns an error.
   */
  refs: GitRefConnection;
  /** Directory listing at path under ref. An empty path returns the root tree. */
  tree: Array<GitTreeEntry>;
  /** The identity created or selected by the user as its own */
  userIdentity: Maybe<Identity>;
  /** List of valid labels. */
  validLabels: LabelConnection;
};


export type RepositoryAllBugsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type RepositoryAllIdentitiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type RepositoryBlobArgs = {
  path: Scalars['String']['input'];
  ref: Scalars['String']['input'];
};


export type RepositoryBugArgs = {
  prefix: Scalars['String']['input'];
};


export type RepositoryCommitArgs = {
  hash: Scalars['String']['input'];
};


export type RepositoryCommitsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
  since?: InputMaybe<Scalars['Time']['input']>;
  until?: InputMaybe<Scalars['Time']['input']>;
};


export type RepositoryIdentityArgs = {
  prefix: Scalars['String']['input'];
};


export type RepositoryLastCommitsArgs = {
  names: Array<Scalars['String']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
};


export type RepositoryRefsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<GitRefType>;
};


export type RepositoryTreeArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
};


export type RepositoryValidLabelsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type RepositoryConnection = {
  __typename: 'RepositoryConnection';
  edges: Array<RepositoryEdge>;
  nodes: Array<Repository>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type RepositoryEdge = {
  __typename: 'RepositoryEdge';
  cursor: Scalars['String']['output'];
  node: Repository;
};

export enum Status {
  Closed = 'CLOSED',
  Open = 'OPEN'
}

export type Subscription = {
  __typename: 'Subscription';
  /** Subscribe to events on all entities. For events on a specific repo you can provide a repo reference. Without it, you get the unique default repo or all repo events. */
  allEvents: EntityEvent;
  /** Subscribe to bug entity events. For events on a specific repo you can provide a repo reference. Without it, you get the unique default repo or all repo events. */
  bugEvents: BugEvent;
  /** Subscribe to identity entity events. For events on a specific repo you can provide a repo reference. Without it, you get the unique default repo or all repo events. */
  identityEvents: IdentityEvent;
};


export type SubscriptionAllEventsArgs = {
  repoRef?: InputMaybe<Scalars['String']['input']>;
  typename?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionBugEventsArgs = {
  repoRef?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionIdentityEventsArgs = {
  repoRef?: InputMaybe<Scalars['String']['input']>;
};

export type BugAddCommentMutationVariables = Exact<{
  input: BugAddCommentInput;
}>;


export type BugAddCommentMutation = { bugAddComment: { __typename: 'BugAddCommentPayload', bug: { __typename: 'Bug', id: string } } };

export type BugAddCommentAndCloseMutationVariables = Exact<{
  input: BugAddCommentAndCloseInput;
}>;


export type BugAddCommentAndCloseMutation = { bugAddCommentAndClose: { __typename: 'BugAddCommentAndClosePayload', bug: { __typename: 'Bug', id: string } } };

export type BugAddCommentAndReopenMutationVariables = Exact<{
  input: BugAddCommentAndReopenInput;
}>;


export type BugAddCommentAndReopenMutation = { bugAddCommentAndReopen: { __typename: 'BugAddCommentAndReopenPayload', bug: { __typename: 'Bug', id: string } } };

export type BugStatusOpenMutationVariables = Exact<{
  input: BugStatusOpenInput;
}>;


export type BugStatusOpenMutation = { bugStatusOpen: { __typename: 'BugStatusOpenPayload', bug: { __typename: 'Bug', id: string, status: Status } } };

export type BugStatusCloseMutationVariables = Exact<{
  input: BugStatusCloseInput;
}>;


export type BugStatusCloseMutation = { bugStatusClose: { __typename: 'BugStatusClosePayload', bug: { __typename: 'Bug', id: string, status: Status } } };

export type BugChangeLabelsMutationVariables = Exact<{
  input?: InputMaybe<BugChangeLabelInput>;
}>;


export type BugChangeLabelsMutation = { bugChangeLabels: { __typename: 'BugChangeLabelPayload', bug: { __typename: 'Bug', id: string, labels: Array<(
        { __typename: 'Label', name: string }
        & { ' $fragmentRefs'?: { 'LabelFieldsFragment': LabelFieldsFragment } }
      )> } } };

export type BugCreateCommentFieldsFragment = { __typename: 'BugCreateTimelineItem', id: string, message: string, createdAt: string, lastEdit: string, edited: boolean, author: (
    { __typename: 'Identity', id: string, humanId: string, displayName: string }
    & { ' $fragmentRefs'?: { 'IdentitySummaryFragment': IdentitySummaryFragment } }
  ) } & { ' $fragmentName'?: 'BugCreateCommentFieldsFragment' };

export type BugAddCommentFieldsFragment = { __typename: 'BugAddCommentTimelineItem', id: string, message: string, createdAt: string, lastEdit: string, edited: boolean, author: (
    { __typename: 'Identity', id: string, humanId: string, displayName: string }
    & { ' $fragmentRefs'?: { 'IdentitySummaryFragment': IdentitySummaryFragment } }
  ) } & { ' $fragmentName'?: 'BugAddCommentFieldsFragment' };

export type LabelChangeFieldsFragment = { __typename: 'BugLabelChangeTimelineItem', date: string, author: { __typename: 'Identity', humanId: string, displayName: string }, added: Array<(
    { __typename: 'Label' }
    & { ' $fragmentRefs'?: { 'LabelFieldsFragment': LabelFieldsFragment } }
  )>, removed: Array<(
    { __typename: 'Label' }
    & { ' $fragmentRefs'?: { 'LabelFieldsFragment': LabelFieldsFragment } }
  )> } & { ' $fragmentName'?: 'LabelChangeFieldsFragment' };

export type StatusChangeFieldsFragment = { __typename: 'BugSetStatusTimelineItem', date: string, status: Status, author: { __typename: 'Identity', humanId: string, displayName: string } } & { ' $fragmentName'?: 'StatusChangeFieldsFragment' };

export type TitleChangeFieldsFragment = { __typename: 'BugSetTitleTimelineItem', date: string, title: string, was: string, author: { __typename: 'Identity', humanId: string, displayName: string } } & { ' $fragmentName'?: 'TitleChangeFieldsFragment' };

export type TimelineItemsFragment = { __typename: 'BugTimelineItemConnection', nodes: Array<
    | (
      { __typename: 'BugAddCommentTimelineItem', id: string }
      & { ' $fragmentRefs'?: { 'BugAddCommentFieldsFragment': BugAddCommentFieldsFragment } }
    )
    | (
      { __typename: 'BugCreateTimelineItem', id: string }
      & { ' $fragmentRefs'?: { 'BugCreateCommentFieldsFragment': BugCreateCommentFieldsFragment } }
    )
    | (
      { __typename: 'BugLabelChangeTimelineItem', id: string }
      & { ' $fragmentRefs'?: { 'LabelChangeFieldsFragment': LabelChangeFieldsFragment } }
    )
    | (
      { __typename: 'BugSetStatusTimelineItem', id: string }
      & { ' $fragmentRefs'?: { 'StatusChangeFieldsFragment': StatusChangeFieldsFragment } }
    )
    | (
      { __typename: 'BugSetTitleTimelineItem', id: string }
      & { ' $fragmentRefs'?: { 'TitleChangeFieldsFragment': TitleChangeFieldsFragment } }
    )
  > } & { ' $fragmentName'?: 'TimelineItemsFragment' };

export type BugEditCommentMutationVariables = Exact<{
  input: BugEditCommentInput;
}>;


export type BugEditCommentMutation = { bugEditComment: { __typename: 'BugEditCommentPayload', bug: { __typename: 'Bug', id: string } } };

export type BugSetTitleMutationVariables = Exact<{
  input: BugSetTitleInput;
}>;


export type BugSetTitleMutation = { bugSetTitle: { __typename: 'BugSetTitlePayload', bug: { __typename: 'Bug', id: string, title: string } } };

export type CommitListQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
  path?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CommitListQuery = { repository: { __typename: 'Repository', commits: { __typename: 'GitCommitConnection', nodes: Array<{ __typename: 'GitCommit', hash: string, shortHash: string, message: string, authorName: string, date: string }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, endCursor: string } } } | null };

export type FileDiffQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  hash: Scalars['String']['input'];
  path: Scalars['String']['input'];
}>;


export type FileDiffQuery = { repository: { __typename: 'Repository', commit: { __typename: 'GitCommit', diff: { __typename: 'GitFileDiff', path: string, oldPath: string | null, isBinary: boolean, isNew: boolean, isDelete: boolean, hunks: Array<{ __typename: 'GitDiffHunk', oldStart: number, oldLines: number, newStart: number, newLines: number, lines: Array<{ __typename: 'GitDiffLine', type: GitDiffLineType, content: string, oldLine: number, newLine: number }> }> } | null } | null } | null };

export type FileViewerBlobFragment = { __typename: 'GitBlob', path: string, hash: string, text: string | null, size: number, isBinary: boolean, isTruncated: boolean } & { ' $fragmentName'?: 'FileViewerBlobFragment' };

export type RefSelectorRefsFragment = { __typename: 'GitRefConnection', nodes: Array<{ __typename: 'GitRef', name: string, shortName: string, type: GitRefType }> } & { ' $fragmentName'?: 'RefSelectorRefsFragment' };

export type IdentitySummaryFragment = { __typename: 'Identity', id: string, humanId: string, displayName: string, avatarUrl: string | null } & { ' $fragmentName'?: 'IdentitySummaryFragment' };

export type BugSummaryFragment = { __typename: 'Bug', id: string, humanId: string, status: Status, title: string, createdAt: string, labels: Array<(
    { __typename: 'Label', name: string }
    & { ' $fragmentRefs'?: { 'LabelFieldsFragment': LabelFieldsFragment } }
  )>, author: (
    { __typename: 'Identity' }
    & { ' $fragmentRefs'?: { 'IdentitySummaryFragment': IdentitySummaryFragment } }
  ), comments: { __typename: 'BugCommentConnection', totalCount: number } } & { ' $fragmentName'?: 'BugSummaryFragment' };

export type LabelFieldsFragment = { __typename: 'Label', name: string, color: { __typename: 'Color', R: number, G: number, B: number } } & { ' $fragmentName'?: 'LabelFieldsFragment' };

export type UserIdentityQueryVariables = Exact<{ [key: string]: never; }>;


export type UserIdentityQuery = { repository: { __typename: 'Repository', userIdentity: (
      { __typename: 'Identity', id: string, humanId: string, displayName: string, avatarUrl: string | null, name: string | null, email: string | null, login: string | null }
      & { ' $fragmentRefs'?: { 'IdentitySummaryFragment': IdentitySummaryFragment } }
    ) | null } | null };

export type CodePageRefsQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
}>;


export type CodePageRefsQuery = { repository: { __typename: 'Repository', name: string | null, head: { __typename: 'GitRef', shortName: string } | null, refs: (
      { __typename: 'GitRefConnection' }
      & { ' $fragmentRefs'?: { 'RefSelectorRefsFragment': RefSelectorRefsFragment } }
    ) } | null };

export type CodePageBlobQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
  path: Scalars['String']['input'];
}>;


export type CodePageBlobQuery = { repository: { __typename: 'Repository', blob: (
      { __typename: 'GitBlob' }
      & { ' $fragmentRefs'?: { 'FileViewerBlobFragment': FileViewerBlobFragment } }
    ) | null } | null };

export type CodePageTreeQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
  path?: InputMaybe<Scalars['String']['input']>;
}>;


export type CodePageTreeQuery = { repository: { __typename: 'Repository', tree: Array<{ __typename: 'GitTreeEntry', name: string, type: GitObjectType, hash: string }> } | null };

export type CodePageLastCommitsQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
  path?: InputMaybe<Scalars['String']['input']>;
  names: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type CodePageLastCommitsQuery = { repository: { __typename: 'Repository', lastCommits: Array<{ __typename: 'GitLastCommit', name: string, commit: { __typename: 'GitCommit', hash: string, shortHash: string, message: string, date: string } }> } | null };

export type CodePageReadmeQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
  path: Scalars['String']['input'];
}>;


export type CodePageReadmeQuery = { repository: { __typename: 'Repository', blob: { __typename: 'GitBlob', text: string | null } | null } | null };

export type AllIdentitiesQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllIdentitiesQuery = { repository: { __typename: 'Repository', allIdentities: { __typename: 'IdentityConnection', nodes: Array<{ __typename: 'Identity', id: string, humanId: string, name: string | null, email: string | null, login: string | null, displayName: string, avatarUrl: string | null }> } } | null };

export type ValidLabelsQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
}>;


export type ValidLabelsQuery = { repository: { __typename: 'Repository', validLabels: { __typename: 'LabelConnection', nodes: Array<(
        { __typename: 'Label', name: string, color: { __typename: 'Color', R: number, G: number, B: number } }
        & { ' $fragmentRefs'?: { 'LabelFieldsFragment': LabelFieldsFragment } }
      )> } } | null };

export type BugDetailQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
  prefix: Scalars['String']['input'];
}>;


export type BugDetailQuery = { repository: { __typename: 'Repository', bug: (
      { __typename: 'Bug', lastEdit: string, participants: { __typename: 'IdentityConnection', nodes: Array<(
          { __typename: 'Identity' }
          & { ' $fragmentRefs'?: { 'IdentitySummaryFragment': IdentitySummaryFragment } }
        )> }, timeline: (
        { __typename: 'BugTimelineItemConnection' }
        & { ' $fragmentRefs'?: { 'TimelineItemsFragment': TimelineItemsFragment } }
      ) }
      & { ' $fragmentRefs'?: { 'BugSummaryFragment': BugSummaryFragment } }
    ) | null } | null };

export type BugListQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
  openQuery: Scalars['String']['input'];
  closedQuery: Scalars['String']['input'];
  listQuery: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type BugListQuery = { repository: { __typename: 'Repository', openCount: { __typename: 'BugConnection', totalCount: number }, closedCount: { __typename: 'BugConnection', totalCount: number }, bugs: { __typename: 'BugConnection', totalCount: number, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, endCursor: string }, nodes: Array<(
        { __typename: 'Bug' }
        & { ' $fragmentRefs'?: { 'BugSummaryFragment': BugSummaryFragment } }
      )> } } | null };

export type BugCreateMutationVariables = Exact<{
  input: BugCreateInput;
}>;


export type BugCreateMutation = { bugCreate: { __typename: 'BugCreatePayload', bug: { __typename: 'Bug', id: string, humanId: string } } };

export type UserProfileQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
  prefix: Scalars['String']['input'];
  openQuery: Scalars['String']['input'];
  closedQuery: Scalars['String']['input'];
  listQuery: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type UserProfileQuery = { repository: { __typename: 'Repository', identity: { __typename: 'Identity', id: string, humanId: string, name: string | null, email: string | null, login: string | null, displayName: string, avatarUrl: string | null, isProtected: boolean } | null, openCount: { __typename: 'BugConnection', totalCount: number }, closedCount: { __typename: 'BugConnection', totalCount: number }, bugs: { __typename: 'BugConnection', totalCount: number, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, endCursor: string }, nodes: Array<(
        { __typename: 'Bug' }
        & { ' $fragmentRefs'?: { 'BugSummaryFragment': BugSummaryFragment } }
      )> } } | null };

export type CommitPageDetailQueryVariables = Exact<{
  repo?: InputMaybe<Scalars['String']['input']>;
  hash: Scalars['String']['input'];
}>;


export type CommitPageDetailQuery = { repository: { __typename: 'Repository', commit: { __typename: 'GitCommit', hash: string, shortHash: string, message: string, fullMessage: string, authorName: string, authorEmail: string, date: string, parents: Array<string>, files: { __typename: 'GitChangedFileConnection', nodes: Array<{ __typename: 'GitChangedFile', path: string, oldPath: string | null, status: GitChangeStatus }> } } | null } | null };

export type RepositoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type RepositoriesQuery = { repositories: { __typename: 'RepositoryConnection', totalCount: number, nodes: Array<{ __typename: 'Repository', name: string | null }> } };

export const IdentitySummaryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]} as unknown as DocumentNode<IdentitySummaryFragment, unknown>;
export const BugCreateCommentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugCreateCommentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugCreateTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"edited"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]} as unknown as DocumentNode<BugCreateCommentFieldsFragment, unknown>;
export const BugAddCommentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugAddCommentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"edited"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]} as unknown as DocumentNode<BugAddCommentFieldsFragment, unknown>;
export const LabelFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}}]} as unknown as DocumentNode<LabelFieldsFragment, unknown>;
export const LabelChangeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugLabelChangeTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"added"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"removed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}}]} as unknown as DocumentNode<LabelChangeFieldsFragment, unknown>;
export const StatusChangeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetStatusTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<StatusChangeFieldsFragment, unknown>;
export const TitleChangeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TitleChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetTitleTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"was"}}]}}]} as unknown as DocumentNode<TitleChangeFieldsFragment, unknown>;
export const TimelineItemsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimelineItems"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugTimelineItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugCreateTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugCreateCommentFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugAddCommentFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugLabelChangeTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelChangeFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetStatusTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusChangeFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetTitleTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TitleChangeFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugCreateCommentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugCreateTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"edited"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugAddCommentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"edited"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugLabelChangeTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"added"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"removed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetStatusTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TitleChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetTitleTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"was"}}]}}]} as unknown as DocumentNode<TimelineItemsFragment, unknown>;
export const FileViewerBlobFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileViewerBlob"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GitBlob"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"isBinary"}},{"kind":"Field","name":{"kind":"Name","value":"isTruncated"}}]}}]} as unknown as DocumentNode<FileViewerBlobFragment, unknown>;
export const RefSelectorRefsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RefSelectorRefs"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GitRefConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shortName"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<RefSelectorRefsFragment, unknown>;
export const BugSummaryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Bug"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]} as unknown as DocumentNode<BugSummaryFragment, unknown>;
export const BugAddCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugAddComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugAddComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<BugAddCommentMutation, BugAddCommentMutationVariables>;
export const BugAddCommentAndCloseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugAddCommentAndClose"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentAndCloseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugAddCommentAndClose"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<BugAddCommentAndCloseMutation, BugAddCommentAndCloseMutationVariables>;
export const BugAddCommentAndReopenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugAddCommentAndReopen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentAndReopenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugAddCommentAndReopen"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<BugAddCommentAndReopenMutation, BugAddCommentAndReopenMutationVariables>;
export const BugStatusOpenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugStatusOpen"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugStatusOpenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugStatusOpen"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<BugStatusOpenMutation, BugStatusOpenMutationVariables>;
export const BugStatusCloseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugStatusClose"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugStatusCloseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugStatusClose"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<BugStatusCloseMutation, BugStatusCloseMutationVariables>;
export const BugChangeLabelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugChangeLabels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BugChangeLabelInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugChangeLabels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}}]} as unknown as DocumentNode<BugChangeLabelsMutation, BugChangeLabelsMutationVariables>;
export const BugEditCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugEditComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugEditCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugEditComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<BugEditCommentMutation, BugEditCommentMutationVariables>;
export const BugSetTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugSetTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetTitleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugSetTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<BugSetTitleMutation, BugSetTitleMutationVariables>;
export const CommitListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CommitList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"shortHash"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CommitListQuery, CommitListQueryVariables>;
export const FileDiffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FileDiff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"oldPath"}},{"kind":"Field","name":{"kind":"Name","value":"isBinary"}},{"kind":"Field","name":{"kind":"Name","value":"isNew"}},{"kind":"Field","name":{"kind":"Name","value":"isDelete"}},{"kind":"Field","name":{"kind":"Name","value":"hunks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"oldStart"}},{"kind":"Field","name":{"kind":"Name","value":"oldLines"}},{"kind":"Field","name":{"kind":"Name","value":"newStart"}},{"kind":"Field","name":{"kind":"Name","value":"newLines"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"oldLine"}},{"kind":"Field","name":{"kind":"Name","value":"newLine"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FileDiffQuery, FileDiffQueryVariables>;
export const UserIdentityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]} as unknown as DocumentNode<UserIdentityQuery, UserIdentityQueryVariables>;
export const CodePageRefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CodePageRefs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"head"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shortName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"refs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RefSelectorRefs"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RefSelectorRefs"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GitRefConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shortName"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<CodePageRefsQuery, CodePageRefsQueryVariables>;
export const CodePageBlobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CodePageBlob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileViewerBlob"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileViewerBlob"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GitBlob"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"isBinary"}},{"kind":"Field","name":{"kind":"Name","value":"isTruncated"}}]}}]} as unknown as DocumentNode<CodePageBlobQuery, CodePageBlobQueryVariables>;
export const CodePageTreeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CodePageTree"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tree"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}}]}}]}}]}}]} as unknown as DocumentNode<CodePageTreeQuery, CodePageTreeQueryVariables>;
export const CodePageLastCommitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CodePageLastCommits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"names"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastCommits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}},{"kind":"Argument","name":{"kind":"Name","value":"names"},"value":{"kind":"Variable","name":{"kind":"Name","value":"names"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"shortHash"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CodePageLastCommitsQuery, CodePageLastCommitsQueryVariables>;
export const CodePageReadmeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CodePageReadme"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}}]} as unknown as DocumentNode<CodePageReadmeQuery, CodePageReadmeQueryVariables>;
export const AllIdentitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllIdentities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allIdentities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AllIdentitiesQuery, AllIdentitiesQueryVariables>;
export const ValidLabelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ValidLabels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validLabels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}}]} as unknown as DocumentNode<ValidLabelsQuery, ValidLabelsQueryVariables>;
export const BugDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BugDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugSummary"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"participants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"250"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelineItems"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugCreateCommentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugCreateTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"edited"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugAddCommentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastEdit"}},{"kind":"Field","name":{"kind":"Name","value":"edited"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugLabelChangeTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"added"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"removed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetStatusTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TitleChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetTitleTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"was"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Bug"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimelineItems"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugTimelineItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugCreateTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugCreateCommentFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugAddCommentTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugAddCommentFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugLabelChangeTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelChangeFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetStatusTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusChangeFields"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BugSetTitleTimelineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TitleChangeFields"}}]}}]}}]}}]} as unknown as DocumentNode<BugDetailQuery, BugDetailQueryVariables>;
export const BugListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BugList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"openQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"closedQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"openCount"},"name":{"kind":"Name","value":"allBugs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"openQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"closedCount"},"name":{"kind":"Name","value":"allBugs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"closedQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"bugs"},"name":{"kind":"Name","value":"allBugs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugSummary"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Bug"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<BugListQuery, BugListQueryVariables>;
export const BugCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BugCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BugCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bugCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bug"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}}]}}]}}]}}]} as unknown as DocumentNode<BugCreateMutation, BugCreateMutationVariables>;
export const UserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"openQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"closedQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isProtected"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"openCount"},"name":{"kind":"Name","value":"allBugs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"openQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"closedCount"},"name":{"kind":"Name","value":"allBugs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"closedQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"bugs"},"name":{"kind":"Name","value":"allBugs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"25"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BugSummary"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LabelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Label"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"R"}},{"kind":"Field","name":{"kind":"Name","value":"G"}},{"kind":"Field","name":{"kind":"Name","value":"B"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IdentitySummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Identity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BugSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Bug"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"humanId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"LabelFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IdentitySummary"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
export const CommitPageDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CommitPageDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"shortHash"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"fullMessage"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"authorEmail"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"parents"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"oldPath"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CommitPageDetailQuery, CommitPageDetailQueryVariables>;
export const RepositoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Repositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<RepositoriesQuery, RepositoriesQueryVariables>;