# V1 Delta View

Action-oriented diff modal: shows what will change in the target and lets the
user opt specific changes out before applying. Distinct from the comparison
modal (`DiffModal`), which is side-by-side reference.

## Layout

Three columns, configurable header on the middle one:

| Field           | Target                         | Exclude              |
| --------------- | ------------------------------ | -------------------- |
| Path / accordion | Target value (or `—` removed)  | Per-row checkbox     |

Top of modal:

- Title + subtitle
- Version selector (disabled / read-only): `Baseline: <from> → Target: <to>`
- Total change count + `Expand all` / `Collapse all`
- Optional warning banner once any row is excluded

Footer: `Close` and a primary action (default label "Restore").

## Why no Baseline column?

`DiffModal` is for **comparison** — Baseline and Target sit beside each other,
each row showing both old and new values. V1 Delta is for **deciding what to
apply**. The user only needs to see the resulting Target value plus a control
to exclude that row from the operation. Showing the previous value would add
noise to the decision. The baseline version is still surfaced — but as context
in the read-only version selector at the top, not as a per-row column.

If a "see baseline value too" affordance is needed later, the conventional
spot would be an expandable per-row detail or a hover tooltip on the Target
cell, not a new column.

## Exclude semantics

- **Leaf rows** show a regular checkbox. Toggling it adds/removes that path
  from the excluded set.
- **Accordion rows** show a checkbox that mirrors its leaves: `checked` when
  every leaf below is excluded, `indeterminate` when some are, `unchecked`
  otherwise. Toggling cascades to all leaves.
- **Header row** ("Exclude" column header) has the same tri-state checkbox
  driving every leaf.
- **Excluded rendering**: the Target cell becomes red italic (`#D0000A`).
  Older versions used a strikethrough — replaced because italic + color is
  less heavy when many rows are excluded, and strikethrough on numbers and
  hyphens read poorly.

The Restore button passes both the target version id and the list of
excluded path keys to the `onRollback` callback. The consumer decides what
to do with them.

## Component shape

```
DiffModalV1Delta            modal shell, header, version selector, controls
└── DiffTreeV1Delta         header row + tree container, sticky header
    └── DiffTreeNodeV1Delta recursive row renderer
        └── DiffValueCellV1 value formatting (shared with V1)
```

Hooks pulled from the shared layer:

- `useDiffTree(fromData, toData, options)` — memoized diff, expanded-path
  state, expand/collapse helpers. Re-applies default expansion when the
  underlying tree changes (keyed on a signature of expandable paths).
- `useVersionComparison(versions, initialFrom?, initialTo?)` — resolves the
  selected baseline/target versions and self-heals when the current
  selection isn't valid for the given list (so a versions-prop swap
  doesn't strand the modal on stale ids).

## Diff semantics

Driven by `buildDiffTree` → `deepDiff`. Important quirks:

- A key present in one side and absent in the other returns a **single**
  `added`/`removed` result at that key — it does **not** recurse. Use this
  when you want a whole subtree to collapse to one row.
- To force individual leaf-level changes while preserving nesting, both
  sides must hold the same container objects, with the leaves differing
  (or one side's container empty). That's how the V1 Record matches modal
  renders each matched record as an individual removed/added leaf rather
  than collapsing to one "Delete records" row.
- Sort order: changed-first, then `key.localeCompare`. Leaves under a
  parent are alphabetical — there's no way to keep insertion order
  without a sort-flag change in `buildDiffTree`.

## Props (`DiffModalV1DeltaProps`)

| Prop                  | Type                                                | Notes                                                 |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `isOpen`              | `boolean`                                           | Required.                                             |
| `onClose`             | `() => void`                                        | Required.                                             |
| `title`               | `string`                                            | Required.                                             |
| `subtitle`            | `string`                                            | Optional override.                                    |
| `versions`            | `Version[]`                                         | Enables the read-only selector + auto-resolved data.  |
| `initialFromVersion`  | `string`                                            | Defaults to `versions[1].id`.                         |
| `initialToVersion`    | `string`                                            | Defaults to `versions[0].id`.                         |
| `fromData` / `toData` | `Record<string, unknown>`                           | Alternative to `versions` for ad-hoc compares.        |
| `valueLabel`          | `string`                                            | Default `"Value"`.                                    |
| `rollbackLabel`       | `string`                                            | Footer primary button label. Default `"Restore"`.     |
| `onRollback`          | `(versionId, excludedPaths) => void`                | Fires on the primary action.                          |
| `diffOptions`         | `DiffOptions`                                       | Forwarded to `deepDiff`.                              |
| `className`           | `string`                                            | Extra classes on the modal panel.                     |

## Related modals

- **`DiffModal`** — side-by-side comparison (Baseline | Target). Use when
  the user needs to see what changed AND what it changed from.
- **`DiffModalV1`** — simplified single-column view, no exclude, no change
  indicators. Use when you just want to show the resulting configuration.
- **`DiffModalV1RecordMatches`** — standalone duplicate of V1 Delta with
  diverged data, currently used for the "Delete records" matches screen.
  Lives in its own component tree so it can drift from V1 Delta without
  breaking it.
