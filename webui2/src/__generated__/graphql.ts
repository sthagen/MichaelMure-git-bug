import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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
  __typename?: 'Bug';
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
  __typename?: 'BugAddCommentAndClosePayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
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
  __typename?: 'BugAddCommentAndReopenPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
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
  __typename?: 'BugAddCommentOperation';
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
  __typename?: 'BugAddCommentPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugAddCommentOperation;
};

/** BugAddCommentTimelineItem is a BugTimelineItem that represent a BugComment and its edition history */
export type BugAddCommentTimelineItem = Authored & BugTimelineItem & {
  __typename?: 'BugAddCommentTimelineItem';
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
  __typename?: 'BugChangeLabelPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugLabelChangeOperation;
  /** The effect each source label had. */
  results: Array<Maybe<LabelChangeResult>>;
};

/** Represents a comment on a bug. */
export type BugComment = Authored & {
  __typename?: 'BugComment';
  /** The author of this comment. */
  author: Identity;
  /** All media's hash referenced in this comment */
  files: Array<Scalars['Hash']['output']>;
  id: Scalars['CombinedId']['output'];
  /** The message of this comment. */
  message: Scalars['String']['output'];
};

export type BugCommentConnection = {
  __typename?: 'BugCommentConnection';
  edges: Array<BugCommentEdge>;
  nodes: Array<BugComment>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BugCommentEdge = {
  __typename?: 'BugCommentEdge';
  cursor: Scalars['String']['output'];
  node: BugComment;
};

/** CommentHistoryStep hold one version of a message in the history */
export type BugCommentHistoryStep = {
  __typename?: 'BugCommentHistoryStep';
  date: Scalars['Time']['output'];
  message: Scalars['String']['output'];
};

/** The connection type for Bug. */
export type BugConnection = {
  __typename?: 'BugConnection';
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
  __typename?: 'BugCreateOperation';
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
  __typename?: 'BugCreatePayload';
  /** The created bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugCreateOperation;
};

/** BugCreateTimelineItem is a BugTimelineItem that represent the creation of a bug and its message edition history */
export type BugCreateTimelineItem = Authored & BugTimelineItem & {
  __typename?: 'BugCreateTimelineItem';
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
  __typename?: 'BugEdge';
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
  __typename?: 'BugEditCommentOperation';
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
  __typename?: 'BugEditCommentPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The resulting operation. */
  operation: BugEditCommentOperation;
};

export type BugEvent = {
  __typename?: 'BugEvent';
  bug: Bug;
  type: EntityEventType;
};

export type BugLabelChangeOperation = Authored & Operation & {
  __typename?: 'BugLabelChangeOperation';
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
  __typename?: 'BugLabelChangeTimelineItem';
  added: Array<Label>;
  author: Identity;
  date: Scalars['Time']['output'];
  /** The identifier of the source operation */
  id: Scalars['CombinedId']['output'];
  removed: Array<Label>;
};

export type BugSetStatusOperation = Authored & Operation & {
  __typename?: 'BugSetStatusOperation';
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
  __typename?: 'BugSetStatusTimelineItem';
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
  __typename?: 'BugSetTitleOperation';
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
  __typename?: 'BugSetTitlePayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The resulting operation */
  operation: BugSetTitleOperation;
};

/** BugLabelChangeTimelineItem is a BugTimelineItem that represent a change in the title of a bug */
export type BugSetTitleTimelineItem = Authored & BugTimelineItem & {
  __typename?: 'BugSetTitleTimelineItem';
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
  __typename?: 'BugStatusClosePayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
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
  __typename?: 'BugStatusOpenPayload';
  /** The affected bug. */
  bug: Bug;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
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
  __typename?: 'BugTimelineItemConnection';
  edges: Array<BugTimelineItemEdge>;
  nodes: Array<BugTimelineItem>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Represent a TimelineItem */
export type BugTimelineItemEdge = {
  __typename?: 'BugTimelineItemEdge';
  cursor: Scalars['String']['output'];
  node: BugTimelineItem;
};

/** Defines a color by red, green and blue components. */
export type Color = {
  __typename?: 'Color';
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
  __typename?: 'EntityEvent';
  entity?: Maybe<Entity>;
  type: EntityEventType;
};

export enum EntityEventType {
  Created = 'CREATED',
  Removed = 'REMOVED',
  Updated = 'UPDATED'
}

/** The content of a git blob (file). */
export type GitBlob = {
  __typename?: 'GitBlob';
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
  text?: Maybe<Scalars['String']['output']>;
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
  __typename?: 'GitChangedFile';
  /** Previous path, non-null only for renames. */
  oldPath?: Maybe<Scalars['String']['output']>;
  /** Path of the file in the new version of the commit. */
  path: Scalars['String']['output'];
  /** How the file was affected by the commit. */
  status: GitChangeStatus;
};

export type GitChangedFileConnection = {
  __typename?: 'GitChangedFileConnection';
  nodes: Array<GitChangedFile>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Metadata for a single git commit. */
export type GitCommit = {
  __typename?: 'GitCommit';
  /** Email address of the commit author. */
  authorEmail: Scalars['String']['output'];
  /** Name of the commit author. */
  authorName: Scalars['String']['output'];
  /** Timestamp from the author field (when the change was originally made). */
  date: Scalars['Time']['output'];
  /** Unified diff for a single file in this commit. */
  diff?: Maybe<GitFileDiff>;
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
  __typename?: 'GitCommitConnection';
  nodes: Array<GitCommit>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A contiguous block of changes in a unified diff. */
export type GitDiffHunk = {
  __typename?: 'GitDiffHunk';
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
  __typename?: 'GitDiffLine';
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
  __typename?: 'GitFileDiff';
  /** Contiguous blocks of changes. Empty for binary files. */
  hunks: Array<GitDiffHunk>;
  /** True when the file is binary and no textual diff is available. */
  isBinary: Scalars['Boolean']['output'];
  /** True when the file was deleted in this commit. */
  isDelete: Scalars['Boolean']['output'];
  /** True when the file was created in this commit. */
  isNew: Scalars['Boolean']['output'];
  /** Previous path, non-null only for renames. */
  oldPath?: Maybe<Scalars['String']['output']>;
  /** Path of the file in the new version. */
  path: Scalars['String']['output'];
};

/** The last commit that touched each requested entry in a directory. */
export type GitLastCommit = {
  __typename?: 'GitLastCommit';
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
  __typename?: 'GitRef';
  /** Commit hash the reference points to. */
  hash: Scalars['String']['output'];
  /** True for the branch HEAD currently points to. */
  isDefault: Scalars['Boolean']['output'];
  /** Full reference name, e.g. refs/heads/main or refs/tags/v1.0. */
  name: Scalars['String']['output'];
  /** Short name, e.g. main or v1.0. */
  shortName: Scalars['String']['output'];
  /** Whether this reference is a branch or a tag. */
  type: GitRefType;
};

export type GitRefConnection = {
  __typename?: 'GitRefConnection';
  nodes: Array<GitRef>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** The kind of git reference: a branch or a tag. */
export enum GitRefType {
  /** A local branch (refs/heads/*). */
  Branch = 'BRANCH',
  /** An annotated or lightweight tag (refs/tags/*). */
  Tag = 'TAG'
}

/** An entry in a git tree (directory listing). */
export type GitTreeEntry = {
  __typename?: 'GitTreeEntry';
  /** Git object hash. */
  hash: Scalars['String']['output'];
  /** File or directory name within the parent tree. */
  name: Scalars['String']['output'];
  /** Whether this entry is a file, directory, symlink, or submodule. */
  type: GitObjectType;
};

/** Represents an identity */
export type Identity = Entity & {
  __typename?: 'Identity';
  /** An url to an avatar */
  avatarUrl?: Maybe<Scalars['String']['output']>;
  /** A non-empty string to display, representing the identity, based on the non-empty values. */
  displayName: Scalars['String']['output'];
  /** The email of the person, if known. */
  email?: Maybe<Scalars['String']['output']>;
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
  login?: Maybe<Scalars['String']['output']>;
  /** The name of the person, if known. */
  name?: Maybe<Scalars['String']['output']>;
};

export type IdentityConnection = {
  __typename?: 'IdentityConnection';
  edges: Array<IdentityEdge>;
  nodes: Array<Identity>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdentityEdge = {
  __typename?: 'IdentityEdge';
  cursor: Scalars['String']['output'];
  node: Identity;
};

export type IdentityEvent = {
  __typename?: 'IdentityEvent';
  identity: Identity;
  type: EntityEventType;
};

/** Label for a bug. */
export type Label = {
  __typename?: 'Label';
  /** Color of the label. */
  color: Color;
  /** The name of the label. */
  name: Scalars['String']['output'];
};

export type LabelChangeResult = {
  __typename?: 'LabelChangeResult';
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
  __typename?: 'LabelConnection';
  edges: Array<LabelEdge>;
  nodes: Array<Label>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type LabelEdge = {
  __typename?: 'LabelEdge';
  cursor: Scalars['String']['output'];
  node: Label;
};

export type Mutation = {
  __typename?: 'Mutation';
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
  __typename?: 'OperationConnection';
  edges: Array<OperationEdge>;
  nodes: Array<Operation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Represent an Operation */
export type OperationEdge = {
  __typename?: 'OperationEdge';
  cursor: Scalars['String']['output'];
  node: Operation;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
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
  __typename?: 'Query';
  /** List all registered repositories. */
  repositories: RepositoryConnection;
  /**
   * Access a repository by reference/name. If no ref is given, the default repository is returned if any.
   * Returns null if the referenced repository does not exist.
   */
  repository?: Maybe<Repository>;
  /** Server configuration and authentication mode. */
  serverConfig: ServerConfig;
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
  __typename?: 'Repository';
  /** All the bugs */
  allBugs: BugConnection;
  /** All the identities */
  allIdentities: IdentityConnection;
  /**
   * Content of the file at path under ref. Null if the path does not exist
   * or resolves to a tree rather than a blob.
   */
  blob?: Maybe<GitBlob>;
  /** Look up a bug by id prefix. Returns null if no bug matches the prefix. */
  bug?: Maybe<Bug>;
  /** A single commit by hash. Returns null if the hash does not exist in the repository. */
  commit?: Maybe<GitCommit>;
  /**
   * Paginated commit log reachable from ref, optionally filtered to commits
   * touching path.
   */
  commits: GitCommitConnection;
  /** Look up an identity by id prefix. Returns null if no identity matches the prefix. */
  identity?: Maybe<Identity>;
  /**
   * The most recent commit that touched each of the named entries in the
   * directory at path under ref. Use this to populate last-commit info on a
   * tree listing without blocking the initial tree fetch.
   */
  lastCommits: Array<GitLastCommit>;
  /** The name of the repository. Null for the default (unnamed) repository in a single-repo setup. */
  name?: Maybe<Scalars['String']['output']>;
  /** All branches and tags, optionally filtered by type. */
  refs: GitRefConnection;
  /** Directory listing at path under ref. An empty path returns the root tree. */
  tree: Array<GitTreeEntry>;
  /** The identity created or selected by the user as its own */
  userIdentity?: Maybe<Identity>;
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
  __typename?: 'RepositoryConnection';
  edges: Array<RepositoryEdge>;
  nodes: Array<Repository>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type RepositoryEdge = {
  __typename?: 'RepositoryEdge';
  cursor: Scalars['String']['output'];
  node: Repository;
};

/** Server-wide configuration, independent of any repository. */
export type ServerConfig = {
  __typename?: 'ServerConfig';
  /**
   * Authentication mode: 'local' (single user from git config),
   * 'external' (multi-user via OAuth/OIDC providers), or 'readonly'.
   */
  authMode: Scalars['String']['output'];
  /**
   * Names of the login providers enabled on this server, e.g. ['github'].
   * Empty when authMode is not 'external'.
   */
  loginProviders: Array<Scalars['String']['output']>;
};

export enum Status {
  Closed = 'CLOSED',
  Open = 'OPEN'
}

export type Subscription = {
  __typename?: 'Subscription';
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

export type AllIdentitiesQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllIdentitiesQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', allIdentities: { __typename?: 'IdentityConnection', nodes: Array<{ __typename?: 'Identity', id: string, humanId: string, name?: string | null, email?: string | null, login?: string | null, displayName: string, avatarUrl?: string | null }> } } | null };

export type BugDetailQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
  prefix: Scalars['String']['input'];
}>;


export type BugDetailQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', bug?: { __typename?: 'Bug', id: string, humanId: string, status: Status, title: string, createdAt: string, lastEdit: string, labels: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }>, author: { __typename?: 'Identity', id: string, humanId: string, displayName: string, avatarUrl?: string | null }, participants: { __typename?: 'IdentityConnection', nodes: Array<{ __typename?: 'Identity', id: string, humanId: string, displayName: string, avatarUrl?: string | null }> }, timeline: { __typename?: 'BugTimelineItemConnection', nodes: Array<
          | { __typename: 'BugAddCommentTimelineItem', message: string, createdAt: string, lastEdit: string, edited: boolean, id: string, author: { __typename?: 'Identity', id: string, humanId: string, displayName: string, avatarUrl?: string | null } }
          | { __typename: 'BugCreateTimelineItem', message: string, createdAt: string, lastEdit: string, edited: boolean, id: string, author: { __typename?: 'Identity', id: string, humanId: string, displayName: string, avatarUrl?: string | null } }
          | { __typename: 'BugLabelChangeTimelineItem', date: string, id: string, author: { __typename?: 'Identity', humanId: string, displayName: string }, added: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }>, removed: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }> }
          | { __typename: 'BugSetStatusTimelineItem', date: string, status: Status, id: string, author: { __typename?: 'Identity', humanId: string, displayName: string } }
          | { __typename: 'BugSetTitleTimelineItem', date: string, title: string, was: string, id: string, author: { __typename?: 'Identity', humanId: string, displayName: string } }
        > } } | null } | null };

export type BugListQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
  openQuery: Scalars['String']['input'];
  closedQuery: Scalars['String']['input'];
  listQuery: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type BugListQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', openCount: { __typename?: 'BugConnection', totalCount: number }, closedCount: { __typename?: 'BugConnection', totalCount: number }, bugs: { __typename?: 'BugConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor: string }, nodes: Array<{ __typename?: 'Bug', id: string, humanId: string, status: Status, title: string, createdAt: string, labels: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }>, author: { __typename?: 'Identity', id: string, humanId: string, displayName: string, avatarUrl?: string | null }, comments: { __typename?: 'BugCommentConnection', totalCount: number } }> } } | null };

export type BugCreateMutationVariables = Exact<{
  input: BugCreateInput;
}>;


export type BugCreateMutation = { __typename?: 'Mutation', bugCreate: { __typename?: 'BugCreatePayload', bug: { __typename?: 'Bug', id: string, humanId: string } } };

export type BugAddCommentMutationVariables = Exact<{
  input: BugAddCommentInput;
}>;


export type BugAddCommentMutation = { __typename?: 'Mutation', bugAddComment: { __typename?: 'BugAddCommentPayload', bug: { __typename?: 'Bug', id: string } } };

export type BugAddCommentAndCloseMutationVariables = Exact<{
  input: BugAddCommentAndCloseInput;
}>;


export type BugAddCommentAndCloseMutation = { __typename?: 'Mutation', bugAddCommentAndClose: { __typename?: 'BugAddCommentAndClosePayload', bug: { __typename?: 'Bug', id: string } } };

export type BugAddCommentAndReopenMutationVariables = Exact<{
  input: BugAddCommentAndReopenInput;
}>;


export type BugAddCommentAndReopenMutation = { __typename?: 'Mutation', bugAddCommentAndReopen: { __typename?: 'BugAddCommentAndReopenPayload', bug: { __typename?: 'Bug', id: string } } };

export type BugEditCommentMutationVariables = Exact<{
  input: BugEditCommentInput;
}>;


export type BugEditCommentMutation = { __typename?: 'Mutation', bugEditComment: { __typename?: 'BugEditCommentPayload', bug: { __typename?: 'Bug', id: string } } };

export type BugChangeLabelsMutationVariables = Exact<{
  input?: InputMaybe<BugChangeLabelInput>;
}>;


export type BugChangeLabelsMutation = { __typename?: 'Mutation', bugChangeLabels: { __typename?: 'BugChangeLabelPayload', bug: { __typename?: 'Bug', id: string, labels: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }> } } };

export type BugStatusOpenMutationVariables = Exact<{
  input: BugStatusOpenInput;
}>;


export type BugStatusOpenMutation = { __typename?: 'Mutation', bugStatusOpen: { __typename?: 'BugStatusOpenPayload', bug: { __typename?: 'Bug', id: string, status: Status } } };

export type BugStatusCloseMutationVariables = Exact<{
  input: BugStatusCloseInput;
}>;


export type BugStatusCloseMutation = { __typename?: 'Mutation', bugStatusClose: { __typename?: 'BugStatusClosePayload', bug: { __typename?: 'Bug', id: string, status: Status } } };

export type BugSetTitleMutationVariables = Exact<{
  input: BugSetTitleInput;
}>;


export type BugSetTitleMutation = { __typename?: 'Mutation', bugSetTitle: { __typename?: 'BugSetTitlePayload', bug: { __typename?: 'Bug', id: string, title: string } } };

export type RepositoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type RepositoriesQuery = { __typename?: 'Query', repositories: { __typename?: 'RepositoryConnection', totalCount: number, nodes: Array<{ __typename?: 'Repository', name?: string | null }> } };

export type ServerConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type ServerConfigQuery = { __typename?: 'Query', serverConfig: { __typename?: 'ServerConfig', authMode: string, loginProviders: Array<string> } };

export type UserProfileQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
  prefix: Scalars['String']['input'];
  openQuery: Scalars['String']['input'];
  closedQuery: Scalars['String']['input'];
  listQuery: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type UserProfileQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', identity?: { __typename?: 'Identity', id: string, humanId: string, name?: string | null, email?: string | null, login?: string | null, displayName: string, avatarUrl?: string | null, isProtected: boolean } | null, openCount: { __typename?: 'BugConnection', totalCount: number }, closedCount: { __typename?: 'BugConnection', totalCount: number }, bugs: { __typename?: 'BugConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor: string }, nodes: Array<{ __typename?: 'Bug', id: string, humanId: string, status: Status, title: string, createdAt: string, labels: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }>, comments: { __typename?: 'BugCommentConnection', totalCount: number } }> } } | null };

export type ValidLabelsQueryVariables = Exact<{
  ref?: InputMaybe<Scalars['String']['input']>;
}>;


export type ValidLabelsQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', validLabels: { __typename?: 'LabelConnection', nodes: Array<{ __typename?: 'Label', name: string, color: { __typename?: 'Color', R: number, G: number, B: number } }> } } | null };


export const AllIdentitiesDocument = gql`
    query AllIdentities($ref: String) {
  repository(ref: $ref) {
    allIdentities(first: 1000) {
      nodes {
        id
        humanId
        name
        email
        login
        displayName
        avatarUrl
      }
    }
  }
}
    `;

/**
 * __useAllIdentitiesQuery__
 *
 * To run a query within a React component, call `useAllIdentitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllIdentitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllIdentitiesQuery({
 *   variables: {
 *      ref: // value for 'ref'
 *   },
 * });
 */
export function useAllIdentitiesQuery(baseOptions?: Apollo.QueryHookOptions<AllIdentitiesQuery, AllIdentitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllIdentitiesQuery, AllIdentitiesQueryVariables>(AllIdentitiesDocument, options);
      }
export function useAllIdentitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllIdentitiesQuery, AllIdentitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllIdentitiesQuery, AllIdentitiesQueryVariables>(AllIdentitiesDocument, options);
        }
// @ts-ignore
export function useAllIdentitiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AllIdentitiesQuery, AllIdentitiesQueryVariables>): Apollo.UseSuspenseQueryResult<AllIdentitiesQuery, AllIdentitiesQueryVariables>;
export function useAllIdentitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllIdentitiesQuery, AllIdentitiesQueryVariables>): Apollo.UseSuspenseQueryResult<AllIdentitiesQuery | undefined, AllIdentitiesQueryVariables>;
export function useAllIdentitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllIdentitiesQuery, AllIdentitiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AllIdentitiesQuery, AllIdentitiesQueryVariables>(AllIdentitiesDocument, options);
        }
export type AllIdentitiesQueryHookResult = ReturnType<typeof useAllIdentitiesQuery>;
export type AllIdentitiesLazyQueryHookResult = ReturnType<typeof useAllIdentitiesLazyQuery>;
export type AllIdentitiesSuspenseQueryHookResult = ReturnType<typeof useAllIdentitiesSuspenseQuery>;
export type AllIdentitiesQueryResult = Apollo.QueryResult<AllIdentitiesQuery, AllIdentitiesQueryVariables>;
export const BugDetailDocument = gql`
    query BugDetail($ref: String, $prefix: String!) {
  repository(ref: $ref) {
    bug(prefix: $prefix) {
      id
      humanId
      status
      title
      labels {
        name
        color {
          R
          G
          B
        }
      }
      author {
        id
        humanId
        displayName
        avatarUrl
      }
      createdAt
      lastEdit
      participants(first: 20) {
        nodes {
          id
          humanId
          displayName
          avatarUrl
        }
      }
      timeline(first: 250) {
        nodes {
          __typename
          id
          ... on BugCreateTimelineItem {
            author {
              id
              humanId
              displayName
              avatarUrl
            }
            message
            createdAt
            lastEdit
            edited
          }
          ... on BugAddCommentTimelineItem {
            author {
              id
              humanId
              displayName
              avatarUrl
            }
            message
            createdAt
            lastEdit
            edited
          }
          ... on BugLabelChangeTimelineItem {
            author {
              humanId
              displayName
            }
            date
            added {
              name
              color {
                R
                G
                B
              }
            }
            removed {
              name
              color {
                R
                G
                B
              }
            }
          }
          ... on BugSetStatusTimelineItem {
            author {
              humanId
              displayName
            }
            date
            status
          }
          ... on BugSetTitleTimelineItem {
            author {
              humanId
              displayName
            }
            date
            title
            was
          }
        }
      }
    }
  }
}
    `;

/**
 * __useBugDetailQuery__
 *
 * To run a query within a React component, call `useBugDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useBugDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBugDetailQuery({
 *   variables: {
 *      ref: // value for 'ref'
 *      prefix: // value for 'prefix'
 *   },
 * });
 */
export function useBugDetailQuery(baseOptions: Apollo.QueryHookOptions<BugDetailQuery, BugDetailQueryVariables> & ({ variables: BugDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BugDetailQuery, BugDetailQueryVariables>(BugDetailDocument, options);
      }
export function useBugDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BugDetailQuery, BugDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BugDetailQuery, BugDetailQueryVariables>(BugDetailDocument, options);
        }
// @ts-ignore
export function useBugDetailSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<BugDetailQuery, BugDetailQueryVariables>): Apollo.UseSuspenseQueryResult<BugDetailQuery, BugDetailQueryVariables>;
export function useBugDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BugDetailQuery, BugDetailQueryVariables>): Apollo.UseSuspenseQueryResult<BugDetailQuery | undefined, BugDetailQueryVariables>;
export function useBugDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BugDetailQuery, BugDetailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BugDetailQuery, BugDetailQueryVariables>(BugDetailDocument, options);
        }
export type BugDetailQueryHookResult = ReturnType<typeof useBugDetailQuery>;
export type BugDetailLazyQueryHookResult = ReturnType<typeof useBugDetailLazyQuery>;
export type BugDetailSuspenseQueryHookResult = ReturnType<typeof useBugDetailSuspenseQuery>;
export type BugDetailQueryResult = Apollo.QueryResult<BugDetailQuery, BugDetailQueryVariables>;
export const BugListDocument = gql`
    query BugList($ref: String, $openQuery: String!, $closedQuery: String!, $listQuery: String!, $first: Int, $after: String) {
  repository(ref: $ref) {
    openCount: allBugs(query: $openQuery, first: 1) {
      totalCount
    }
    closedCount: allBugs(query: $closedQuery, first: 1) {
      totalCount
    }
    bugs: allBugs(query: $listQuery, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        humanId
        status
        title
        labels {
          name
          color {
            R
            G
            B
          }
        }
        author {
          id
          humanId
          displayName
          avatarUrl
        }
        createdAt
        comments {
          totalCount
        }
      }
    }
  }
}
    `;

/**
 * __useBugListQuery__
 *
 * To run a query within a React component, call `useBugListQuery` and pass it any options that fit your needs.
 * When your component renders, `useBugListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBugListQuery({
 *   variables: {
 *      ref: // value for 'ref'
 *      openQuery: // value for 'openQuery'
 *      closedQuery: // value for 'closedQuery'
 *      listQuery: // value for 'listQuery'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useBugListQuery(baseOptions: Apollo.QueryHookOptions<BugListQuery, BugListQueryVariables> & ({ variables: BugListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BugListQuery, BugListQueryVariables>(BugListDocument, options);
      }
export function useBugListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BugListQuery, BugListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BugListQuery, BugListQueryVariables>(BugListDocument, options);
        }
// @ts-ignore
export function useBugListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<BugListQuery, BugListQueryVariables>): Apollo.UseSuspenseQueryResult<BugListQuery, BugListQueryVariables>;
export function useBugListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BugListQuery, BugListQueryVariables>): Apollo.UseSuspenseQueryResult<BugListQuery | undefined, BugListQueryVariables>;
export function useBugListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BugListQuery, BugListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BugListQuery, BugListQueryVariables>(BugListDocument, options);
        }
export type BugListQueryHookResult = ReturnType<typeof useBugListQuery>;
export type BugListLazyQueryHookResult = ReturnType<typeof useBugListLazyQuery>;
export type BugListSuspenseQueryHookResult = ReturnType<typeof useBugListSuspenseQuery>;
export type BugListQueryResult = Apollo.QueryResult<BugListQuery, BugListQueryVariables>;
export const BugCreateDocument = gql`
    mutation BugCreate($input: BugCreateInput!) {
  bugCreate(input: $input) {
    bug {
      id
      humanId
    }
  }
}
    `;
export type BugCreateMutationFn = Apollo.MutationFunction<BugCreateMutation, BugCreateMutationVariables>;

/**
 * __useBugCreateMutation__
 *
 * To run a mutation, you first call `useBugCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugCreateMutation, { data, loading, error }] = useBugCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugCreateMutation(baseOptions?: Apollo.MutationHookOptions<BugCreateMutation, BugCreateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugCreateMutation, BugCreateMutationVariables>(BugCreateDocument, options);
      }
export type BugCreateMutationHookResult = ReturnType<typeof useBugCreateMutation>;
export type BugCreateMutationResult = Apollo.MutationResult<BugCreateMutation>;
export type BugCreateMutationOptions = Apollo.BaseMutationOptions<BugCreateMutation, BugCreateMutationVariables>;
export const BugAddCommentDocument = gql`
    mutation BugAddComment($input: BugAddCommentInput!) {
  bugAddComment(input: $input) {
    bug {
      id
    }
  }
}
    `;
export type BugAddCommentMutationFn = Apollo.MutationFunction<BugAddCommentMutation, BugAddCommentMutationVariables>;

/**
 * __useBugAddCommentMutation__
 *
 * To run a mutation, you first call `useBugAddCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugAddCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugAddCommentMutation, { data, loading, error }] = useBugAddCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugAddCommentMutation(baseOptions?: Apollo.MutationHookOptions<BugAddCommentMutation, BugAddCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugAddCommentMutation, BugAddCommentMutationVariables>(BugAddCommentDocument, options);
      }
export type BugAddCommentMutationHookResult = ReturnType<typeof useBugAddCommentMutation>;
export type BugAddCommentMutationResult = Apollo.MutationResult<BugAddCommentMutation>;
export type BugAddCommentMutationOptions = Apollo.BaseMutationOptions<BugAddCommentMutation, BugAddCommentMutationVariables>;
export const BugAddCommentAndCloseDocument = gql`
    mutation BugAddCommentAndClose($input: BugAddCommentAndCloseInput!) {
  bugAddCommentAndClose(input: $input) {
    bug {
      id
    }
  }
}
    `;
export type BugAddCommentAndCloseMutationFn = Apollo.MutationFunction<BugAddCommentAndCloseMutation, BugAddCommentAndCloseMutationVariables>;

/**
 * __useBugAddCommentAndCloseMutation__
 *
 * To run a mutation, you first call `useBugAddCommentAndCloseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugAddCommentAndCloseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugAddCommentAndCloseMutation, { data, loading, error }] = useBugAddCommentAndCloseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugAddCommentAndCloseMutation(baseOptions?: Apollo.MutationHookOptions<BugAddCommentAndCloseMutation, BugAddCommentAndCloseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugAddCommentAndCloseMutation, BugAddCommentAndCloseMutationVariables>(BugAddCommentAndCloseDocument, options);
      }
export type BugAddCommentAndCloseMutationHookResult = ReturnType<typeof useBugAddCommentAndCloseMutation>;
export type BugAddCommentAndCloseMutationResult = Apollo.MutationResult<BugAddCommentAndCloseMutation>;
export type BugAddCommentAndCloseMutationOptions = Apollo.BaseMutationOptions<BugAddCommentAndCloseMutation, BugAddCommentAndCloseMutationVariables>;
export const BugAddCommentAndReopenDocument = gql`
    mutation BugAddCommentAndReopen($input: BugAddCommentAndReopenInput!) {
  bugAddCommentAndReopen(input: $input) {
    bug {
      id
    }
  }
}
    `;
export type BugAddCommentAndReopenMutationFn = Apollo.MutationFunction<BugAddCommentAndReopenMutation, BugAddCommentAndReopenMutationVariables>;

/**
 * __useBugAddCommentAndReopenMutation__
 *
 * To run a mutation, you first call `useBugAddCommentAndReopenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugAddCommentAndReopenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugAddCommentAndReopenMutation, { data, loading, error }] = useBugAddCommentAndReopenMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugAddCommentAndReopenMutation(baseOptions?: Apollo.MutationHookOptions<BugAddCommentAndReopenMutation, BugAddCommentAndReopenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugAddCommentAndReopenMutation, BugAddCommentAndReopenMutationVariables>(BugAddCommentAndReopenDocument, options);
      }
export type BugAddCommentAndReopenMutationHookResult = ReturnType<typeof useBugAddCommentAndReopenMutation>;
export type BugAddCommentAndReopenMutationResult = Apollo.MutationResult<BugAddCommentAndReopenMutation>;
export type BugAddCommentAndReopenMutationOptions = Apollo.BaseMutationOptions<BugAddCommentAndReopenMutation, BugAddCommentAndReopenMutationVariables>;
export const BugEditCommentDocument = gql`
    mutation BugEditComment($input: BugEditCommentInput!) {
  bugEditComment(input: $input) {
    bug {
      id
    }
  }
}
    `;
export type BugEditCommentMutationFn = Apollo.MutationFunction<BugEditCommentMutation, BugEditCommentMutationVariables>;

/**
 * __useBugEditCommentMutation__
 *
 * To run a mutation, you first call `useBugEditCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugEditCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugEditCommentMutation, { data, loading, error }] = useBugEditCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugEditCommentMutation(baseOptions?: Apollo.MutationHookOptions<BugEditCommentMutation, BugEditCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugEditCommentMutation, BugEditCommentMutationVariables>(BugEditCommentDocument, options);
      }
export type BugEditCommentMutationHookResult = ReturnType<typeof useBugEditCommentMutation>;
export type BugEditCommentMutationResult = Apollo.MutationResult<BugEditCommentMutation>;
export type BugEditCommentMutationOptions = Apollo.BaseMutationOptions<BugEditCommentMutation, BugEditCommentMutationVariables>;
export const BugChangeLabelsDocument = gql`
    mutation BugChangeLabels($input: BugChangeLabelInput) {
  bugChangeLabels(input: $input) {
    bug {
      id
      labels {
        name
        color {
          R
          G
          B
        }
      }
    }
  }
}
    `;
export type BugChangeLabelsMutationFn = Apollo.MutationFunction<BugChangeLabelsMutation, BugChangeLabelsMutationVariables>;

/**
 * __useBugChangeLabelsMutation__
 *
 * To run a mutation, you first call `useBugChangeLabelsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugChangeLabelsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugChangeLabelsMutation, { data, loading, error }] = useBugChangeLabelsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugChangeLabelsMutation(baseOptions?: Apollo.MutationHookOptions<BugChangeLabelsMutation, BugChangeLabelsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugChangeLabelsMutation, BugChangeLabelsMutationVariables>(BugChangeLabelsDocument, options);
      }
export type BugChangeLabelsMutationHookResult = ReturnType<typeof useBugChangeLabelsMutation>;
export type BugChangeLabelsMutationResult = Apollo.MutationResult<BugChangeLabelsMutation>;
export type BugChangeLabelsMutationOptions = Apollo.BaseMutationOptions<BugChangeLabelsMutation, BugChangeLabelsMutationVariables>;
export const BugStatusOpenDocument = gql`
    mutation BugStatusOpen($input: BugStatusOpenInput!) {
  bugStatusOpen(input: $input) {
    bug {
      id
      status
    }
  }
}
    `;
export type BugStatusOpenMutationFn = Apollo.MutationFunction<BugStatusOpenMutation, BugStatusOpenMutationVariables>;

/**
 * __useBugStatusOpenMutation__
 *
 * To run a mutation, you first call `useBugStatusOpenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugStatusOpenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugStatusOpenMutation, { data, loading, error }] = useBugStatusOpenMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugStatusOpenMutation(baseOptions?: Apollo.MutationHookOptions<BugStatusOpenMutation, BugStatusOpenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugStatusOpenMutation, BugStatusOpenMutationVariables>(BugStatusOpenDocument, options);
      }
export type BugStatusOpenMutationHookResult = ReturnType<typeof useBugStatusOpenMutation>;
export type BugStatusOpenMutationResult = Apollo.MutationResult<BugStatusOpenMutation>;
export type BugStatusOpenMutationOptions = Apollo.BaseMutationOptions<BugStatusOpenMutation, BugStatusOpenMutationVariables>;
export const BugStatusCloseDocument = gql`
    mutation BugStatusClose($input: BugStatusCloseInput!) {
  bugStatusClose(input: $input) {
    bug {
      id
      status
    }
  }
}
    `;
export type BugStatusCloseMutationFn = Apollo.MutationFunction<BugStatusCloseMutation, BugStatusCloseMutationVariables>;

/**
 * __useBugStatusCloseMutation__
 *
 * To run a mutation, you first call `useBugStatusCloseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugStatusCloseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugStatusCloseMutation, { data, loading, error }] = useBugStatusCloseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugStatusCloseMutation(baseOptions?: Apollo.MutationHookOptions<BugStatusCloseMutation, BugStatusCloseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugStatusCloseMutation, BugStatusCloseMutationVariables>(BugStatusCloseDocument, options);
      }
export type BugStatusCloseMutationHookResult = ReturnType<typeof useBugStatusCloseMutation>;
export type BugStatusCloseMutationResult = Apollo.MutationResult<BugStatusCloseMutation>;
export type BugStatusCloseMutationOptions = Apollo.BaseMutationOptions<BugStatusCloseMutation, BugStatusCloseMutationVariables>;
export const BugSetTitleDocument = gql`
    mutation BugSetTitle($input: BugSetTitleInput!) {
  bugSetTitle(input: $input) {
    bug {
      id
      title
    }
  }
}
    `;
export type BugSetTitleMutationFn = Apollo.MutationFunction<BugSetTitleMutation, BugSetTitleMutationVariables>;

/**
 * __useBugSetTitleMutation__
 *
 * To run a mutation, you first call `useBugSetTitleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBugSetTitleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bugSetTitleMutation, { data, loading, error }] = useBugSetTitleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBugSetTitleMutation(baseOptions?: Apollo.MutationHookOptions<BugSetTitleMutation, BugSetTitleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BugSetTitleMutation, BugSetTitleMutationVariables>(BugSetTitleDocument, options);
      }
export type BugSetTitleMutationHookResult = ReturnType<typeof useBugSetTitleMutation>;
export type BugSetTitleMutationResult = Apollo.MutationResult<BugSetTitleMutation>;
export type BugSetTitleMutationOptions = Apollo.BaseMutationOptions<BugSetTitleMutation, BugSetTitleMutationVariables>;
export const RepositoriesDocument = gql`
    query Repositories {
  repositories {
    nodes {
      name
    }
    totalCount
  }
}
    `;

/**
 * __useRepositoriesQuery__
 *
 * To run a query within a React component, call `useRepositoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRepositoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRepositoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useRepositoriesQuery(baseOptions?: Apollo.QueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RepositoriesQuery, RepositoriesQueryVariables>(RepositoriesDocument, options);
      }
export function useRepositoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RepositoriesQuery, RepositoriesQueryVariables>(RepositoriesDocument, options);
        }
// @ts-ignore
export function useRepositoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>): Apollo.UseSuspenseQueryResult<RepositoriesQuery, RepositoriesQueryVariables>;
export function useRepositoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>): Apollo.UseSuspenseQueryResult<RepositoriesQuery | undefined, RepositoriesQueryVariables>;
export function useRepositoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RepositoriesQuery, RepositoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RepositoriesQuery, RepositoriesQueryVariables>(RepositoriesDocument, options);
        }
export type RepositoriesQueryHookResult = ReturnType<typeof useRepositoriesQuery>;
export type RepositoriesLazyQueryHookResult = ReturnType<typeof useRepositoriesLazyQuery>;
export type RepositoriesSuspenseQueryHookResult = ReturnType<typeof useRepositoriesSuspenseQuery>;
export type RepositoriesQueryResult = Apollo.QueryResult<RepositoriesQuery, RepositoriesQueryVariables>;
export const ServerConfigDocument = gql`
    query ServerConfig {
  serverConfig {
    authMode
    loginProviders
  }
}
    `;

/**
 * __useServerConfigQuery__
 *
 * To run a query within a React component, call `useServerConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerConfigQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerConfigQuery(baseOptions?: Apollo.QueryHookOptions<ServerConfigQuery, ServerConfigQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ServerConfigQuery, ServerConfigQueryVariables>(ServerConfigDocument, options);
      }
export function useServerConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ServerConfigQuery, ServerConfigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ServerConfigQuery, ServerConfigQueryVariables>(ServerConfigDocument, options);
        }
// @ts-ignore
export function useServerConfigSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ServerConfigQuery, ServerConfigQueryVariables>): Apollo.UseSuspenseQueryResult<ServerConfigQuery, ServerConfigQueryVariables>;
export function useServerConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ServerConfigQuery, ServerConfigQueryVariables>): Apollo.UseSuspenseQueryResult<ServerConfigQuery | undefined, ServerConfigQueryVariables>;
export function useServerConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ServerConfigQuery, ServerConfigQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ServerConfigQuery, ServerConfigQueryVariables>(ServerConfigDocument, options);
        }
export type ServerConfigQueryHookResult = ReturnType<typeof useServerConfigQuery>;
export type ServerConfigLazyQueryHookResult = ReturnType<typeof useServerConfigLazyQuery>;
export type ServerConfigSuspenseQueryHookResult = ReturnType<typeof useServerConfigSuspenseQuery>;
export type ServerConfigQueryResult = Apollo.QueryResult<ServerConfigQuery, ServerConfigQueryVariables>;
export const UserProfileDocument = gql`
    query UserProfile($ref: String, $prefix: String!, $openQuery: String!, $closedQuery: String!, $listQuery: String!, $after: String) {
  repository(ref: $ref) {
    identity(prefix: $prefix) {
      id
      humanId
      name
      email
      login
      displayName
      avatarUrl
      isProtected
    }
    openCount: allBugs(query: $openQuery, first: 1) {
      totalCount
    }
    closedCount: allBugs(query: $closedQuery, first: 1) {
      totalCount
    }
    bugs: allBugs(query: $listQuery, first: 25, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        humanId
        status
        title
        labels {
          name
          color {
            R
            G
            B
          }
        }
        createdAt
        comments {
          totalCount
        }
      }
    }
  }
}
    `;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *      ref: // value for 'ref'
 *      prefix: // value for 'prefix'
 *      openQuery: // value for 'openQuery'
 *      closedQuery: // value for 'closedQuery'
 *      listQuery: // value for 'listQuery'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useUserProfileQuery(baseOptions: Apollo.QueryHookOptions<UserProfileQuery, UserProfileQueryVariables> & ({ variables: UserProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserProfileQuery, UserProfileQueryVariables>(UserProfileDocument, options);
      }
export function useUserProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserProfileQuery, UserProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserProfileQuery, UserProfileQueryVariables>(UserProfileDocument, options);
        }
// @ts-ignore
export function useUserProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<UserProfileQuery, UserProfileQueryVariables>): Apollo.UseSuspenseQueryResult<UserProfileQuery, UserProfileQueryVariables>;
export function useUserProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserProfileQuery, UserProfileQueryVariables>): Apollo.UseSuspenseQueryResult<UserProfileQuery | undefined, UserProfileQueryVariables>;
export function useUserProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserProfileQuery, UserProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UserProfileQuery, UserProfileQueryVariables>(UserProfileDocument, options);
        }
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<typeof useUserProfileLazyQuery>;
export type UserProfileSuspenseQueryHookResult = ReturnType<typeof useUserProfileSuspenseQuery>;
export type UserProfileQueryResult = Apollo.QueryResult<UserProfileQuery, UserProfileQueryVariables>;
export const ValidLabelsDocument = gql`
    query ValidLabels($ref: String) {
  repository(ref: $ref) {
    validLabels {
      nodes {
        name
        color {
          R
          G
          B
        }
      }
    }
  }
}
    `;

/**
 * __useValidLabelsQuery__
 *
 * To run a query within a React component, call `useValidLabelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidLabelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidLabelsQuery({
 *   variables: {
 *      ref: // value for 'ref'
 *   },
 * });
 */
export function useValidLabelsQuery(baseOptions?: Apollo.QueryHookOptions<ValidLabelsQuery, ValidLabelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ValidLabelsQuery, ValidLabelsQueryVariables>(ValidLabelsDocument, options);
      }
export function useValidLabelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ValidLabelsQuery, ValidLabelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ValidLabelsQuery, ValidLabelsQueryVariables>(ValidLabelsDocument, options);
        }
// @ts-ignore
export function useValidLabelsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ValidLabelsQuery, ValidLabelsQueryVariables>): Apollo.UseSuspenseQueryResult<ValidLabelsQuery, ValidLabelsQueryVariables>;
export function useValidLabelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ValidLabelsQuery, ValidLabelsQueryVariables>): Apollo.UseSuspenseQueryResult<ValidLabelsQuery | undefined, ValidLabelsQueryVariables>;
export function useValidLabelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ValidLabelsQuery, ValidLabelsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ValidLabelsQuery, ValidLabelsQueryVariables>(ValidLabelsDocument, options);
        }
export type ValidLabelsQueryHookResult = ReturnType<typeof useValidLabelsQuery>;
export type ValidLabelsLazyQueryHookResult = ReturnType<typeof useValidLabelsLazyQuery>;
export type ValidLabelsSuspenseQueryHookResult = ReturnType<typeof useValidLabelsSuspenseQuery>;
export type ValidLabelsQueryResult = Apollo.QueryResult<ValidLabelsQuery, ValidLabelsQueryVariables>;