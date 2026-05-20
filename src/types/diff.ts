/**
 * Type of change detected in a diff comparison
 */
export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

/**
 * Summary of changes at a node level
 */
export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  total: number;
}

/**
 * Represents a node in the diff tree structure
 */
export interface DiffNode {
  /** Unique identifier for this node (the key name) */
  key: string;
  /** Full path from root (e.g., ['settings', 'notifications', 'email']) */
  path: string[];
  /** String representation of path for Set operations */
  pathKey: string;
  /** Type of change detected */
  changeType: ChangeType;
  /** Original value (undefined if added) */
  fromValue?: unknown;
  /** New value (undefined if removed) */
  toValue?: unknown;
  /** Child nodes for nested objects/arrays */
  children?: DiffNode[];
  /** Whether this node represents an array */
  isArray?: boolean;
  /** Whether this node represents an object (has children) */
  isObject?: boolean;
  /** Aggregated change summary for parent nodes */
  summary?: DiffSummary;
  /** Display label (may differ from key for readability) */
  displayLabel?: string;
}

/**
 * Represents a version for comparison
 */
export interface Version {
  id: string;
  label: string;
  timestamp?: Date;
  author?: string;
  metadata?: Record<string, unknown>;
  data: Record<string, unknown>;
}

/**
 * Options for the diff algorithm
 */
export interface DiffOptions {
  /** Include unchanged nodes in output (default: false) */
  includeUnchanged?: boolean;
  /** Maximum depth to traverse (-1 for unlimited, default: -1) */
  maxDepth?: number;
  /** Key to use for array item matching (e.g., 'id') */
  arrayMatchKey?: string;
}

/**
 * Props for the DiffModal component
 */
export interface DiffModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Source data for comparison (used when versions not provided) */
  fromData?: Record<string, unknown>;
  /** Target data for comparison (used when versions not provided) */
  toData?: Record<string, unknown>;
  /** Label for "from" column (default: "Baseline") */
  fromLabel?: string;
  /** Label for "to" column (default: "Target") */
  toLabel?: string;
  /** Enable version selector mode with list of versions */
  versions?: Version[];
  /** Initially selected from version (defaults to second version) */
  initialFromVersion?: string;
  /** Initially selected to version (defaults to first version) */
  initialToVersion?: string;
  /** Diff algorithm options */
  diffOptions?: DiffOptions;
  /** Additional CSS classes for the modal */
  className?: string;
  /** Callback when rollback button is clicked (receives the target version ID) */
  onRollback?: (versionId: string) => void;
  /** Label for rollback button (default: "Rollback") */
  rollbackLabel?: string;
}

/**
 * Props for the VersionSelector component
 */
export interface VersionSelectorProps {
  /** Available versions */
  versions: Version[];
  /** Selected from version ID */
  fromVersion: string;
  /** Selected to version ID */
  toVersion: string;
  /** From version change callback */
  onFromChange: (versionId: string) => void;
  /** To version change callback */
  onToChange: (versionId: string) => void;
  /** Enable "View Summary" mode (compare to predecessor) */
  showSummaryOption?: boolean;
  /** Summary mode active */
  summaryMode?: boolean;
  /** Summary mode toggle callback */
  onSummaryModeChange?: (enabled: boolean) => void;
}

/**
 * Props for the DiffTree component
 */
export interface DiffTreeProps {
  /** Root diff nodes to render */
  nodes: DiffNode[];
  /** Set of expanded path keys */
  expandedPaths: Set<string>;
  /** Toggle expansion callback */
  onToggleExpand: (pathKey: string) => void;
  /** Label for from column */
  fromLabel: string;
  /** Label for to column */
  toLabel: string;
}

/**
 * Props for the DiffTreeNode component
 */
export interface DiffTreeNodeProps {
  /** The diff node data */
  node: DiffNode;
  /** Nesting depth (0 = root level) */
  depth: number;
  /** Whether this node is expanded */
  isExpanded: boolean;
  /** Set of all expanded path keys */
  expandedPaths: Set<string>;
  /** Toggle expansion callback */
  onToggle: (pathKey: string) => void;
  /** Whether this is the last child in parent */
  isLastChild: boolean;
  /** Parent connector line states (true = show line) */
  parentLines: boolean[];
}

/**
 * Props for the DiffValueCell component
 */
export interface DiffValueCellProps {
  /** Value to display */
  value: unknown;
  /** Type of change for styling */
  changeType: ChangeType;
  /** Whether this is the "from" or "to" column */
  column: 'from' | 'to';
  /** Max length before truncation */
  maxLength?: number;
}

/**
 * Represents a breaking change that prevents rollback
 */
export interface BreakingChange {
  /** Type of record that conflicts */
  recordType: string;
  /** Number of records affected */
  count: number;
  /** Description of why this is a breaking change */
  reason: string;
  /** Optional details about specific records */
  details?: string[];
}

/**
 * Props for the ChangeTypeBadge component
 */
export interface ChangeTypeBadgeProps {
  /** Type of change */
  type: ChangeType;
  /** Count to display (for summary badges) */
  count?: number;
  /** Display style */
  variant?: 'text' | 'pill' | 'dot';
  /** Size */
  size?: 'sm' | 'md';
}
