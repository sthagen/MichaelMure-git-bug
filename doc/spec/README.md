# git-bug data format specification

This directory contains the formal specification for the data format used by git-bug to
store entities (bugs, pull-requests, …) and identities inside a git repository.

For the motivation behind the design — why operations instead of snapshots, why Lamport
clocks, why git objects — start with
[Data model - the rational](../data-model-rational.md).


## Documents

### [DAG entity format](dag-entity.md)

The base layer shared by all entity types. Covers:

- How entities are stored as chains of git commits
- Git reference naming (`refs/<namespace>/<id>`)
- Tree entry layout (`ops`, `version-N`, `edit-clock-N`, `create-clock-N`, `extra/`)
- OperationPack JSON structure and ID derivation
- Common operation fields (type, timestamp, nonce, metadata)
- File attachments, unknown operation handling, `SetMetadataOperation`, `NoOpOperation`
- Lamport clock encoding and witnessing
- Operation ordering algorithm (deterministic, clock-based)
- Merge algorithm (5 scenarios, including merge commits for concurrent edits)
- Commit signing with OpenPGP
- Conformance requirements for readers and writers

### [Identity format](identity.md)

The identity layer, which is independent of the DAG entity format. Covers:

- How user identities are stored as linear commit chains
- Git reference naming (`refs/identities/<id>`)
- Version blob JSON structure (name, email, keys, Lamport times, nonce)
- OpenPGP public key storage and key rotation
- Identity ID derivation
- Fast-forward-only merge policy
- Key lookup algorithm for signature verification
- Known limitations (repository-local IDs, no concurrent edit support)

### [Bug entity](bug.md)

The `bug` entity, built on top of the DAG entity format. Covers:

- Namespace (`bugs`) and format version (4)
- All operation types with integer constants, field tables, and JSON examples:
  `CreateOp`, `SetTitleOp`, `AddCommentOp`, `SetStatusOp`, `LabelChangeOp`,
  `EditCommentOp`, `NoOpOp`, `SetMetadataOp`
- Snapshot semantics (title, status, labels, comments, actors, participants)

### Future entity specs

Additional specs will be added here as new entity types are implemented
(pull-requests, kanban boards, …). Each spec follows the same structure as `bug.md`.


## Third-party implementations and extensions

Third-party clients, tools, and extensions that implement or build on this format are
welcome. The additive extensibility described below means that new operation types and
entity namespaces can be introduced independently, without modifying git-bug itself.

That said, **coordination helps avoid conflicts**. Because operation type integers are
scoped per entity and entity namespaces are plain strings, two independent parties could
accidentally pick the same value for different purposes. If you are building something
intended for broad use, opening a discussion on the git-bug issue tracker is encouraged so
that identifiers can be reserved and extensions can be made visible to the wider ecosystem.


## Design principles

### CRDT

git-bug entities are **operation-based CRDTs** (CmRDTs). Rather than storing the current
state of an entity directly, git-bug stores the sequence of *operations* that produced that
state. The current state (the *snapshot*) is always derived by replaying those operations;
it is never stored persistently.

This design makes distributed merging conflict-free. When two replicas diverge — say, two
developers each add a comment to the same bug while offline — merging them is simply a
matter of taking the union of both operation sets. No human intervention is needed. A merge
commit with an empty operation pack records that the union has happened in git's history.

Convergence is guaranteed by replaying operations in a **deterministic total order** defined
by Lamport logical clocks: any two nodes that have received the same set of operations will
produce byte-identical snapshots. Lamport clocks capture causality; where two operations are
truly concurrent (same clock value), ties are broken by operation pack ID — arbitrary, but
stable and hard to manipulate. Each entity's operations are designed so that this ordering
produces meaningful conflict resolution (last-write-wins on scalar fields, set semantics on
collections, append-only on logs).

### Additive extensibility

The CRDT model also makes the format naturally extensible. New operation types work on new
parts of the snapshot and are ignored by clients that do not implement them. A client that
encounters an unknown operation type skips it and produces a *degraded-but-valid* snapshot:
the state it understands is correct and consistent, just incomplete from the perspective of
a fully capable client.

This means new features (a bug assignee field, a priority level, …) can be added as new
operation types without forcing existing clients to update. Entire new entity namespaces
(pull-requests, kanban boards, …) can be introduced the same way: clients that do not
implement a namespace ignore it entirely.

The same principle applies in the other direction: a client that only implements a subset of
operations can still participate in the network, read the operations it understands, and
write new operations, without corrupting the history for clients that implement more.

### Combined IDs

Some elements within an entity — such as a comment within a bug — need a stable identifier
that can be used in APIs and UIs. Rather than minting a separate ID, git-bug derives a
**combined ID** from two regular IDs (a *primary* and a *secondary*) by interleaving their
characters in a fixed pattern:

```
PSPSPSPPPSPPPPSPPPPSPPPPSPPPPSPPPPSPPPPSPPPPSPPPPSPPPPSPPPPSPPPP
```

(P = primary character, S = secondary character)

The result is a 64-character string encoding 50 characters from the primary and 14 from the
secondary. Because the interleaving is front-heavy, a short prefix of the combined ID
contains a useful prefix of both source IDs:

| Combined prefix length | Primary prefix chars | Secondary prefix chars |
|------------------------|----------------------|------------------------|
| 5                      | 3                    | 2                      |
| 7                      | 4                    | 3                      |
| 10                     | 6                    | 4                      |
| 16                     | 11                   | 5                      |

A 7-character prefix is enough to identify both the entity and the element with low
collision risk.

Combined IDs are **not stored in the git format**. They are derived at read time and used
by APIs and UIs to reference secondary elements. The bug entity uses them for comment
identifiers (primary = bug ID, secondary = operation ID that created the comment). Other
entity types may apply the same scheme to their own secondary elements.

### Format stability

The format has been stable in practice because breaking changes are costly — migrating
existing repositories requires dedicated tooling (see
[git-bug-migration](https://github.com/git-bug/git-bug-migration)). No formal stability
promise is made, but the format version number encoded in every commit's tree is the
mechanism for signalling incompatible changes, and a reader must check it before decoding.

