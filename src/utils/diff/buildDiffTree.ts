import type { DiffNode, DiffOptions, DiffSummary } from '../../types/diff';
import type { DiffResult } from './deepDiff';
import { deepDiff } from './deepDiff';

/**
 * Convert a key to a human-readable display label
 */
function keyToDisplayLabel(key: string): string {
  // Handle array indices
  if (key.startsWith('[') && key.endsWith(']')) {
    return key;
  }

  // Convert camelCase or snake_case to Title Case with spaces
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Insert a diff result into the tree structure
 */
function insertDiffResult(root: DiffNode, result: DiffResult): void {
  let current = root;

  for (let i = 0; i < result.path.length; i++) {
    const key = result.path[i];
    const isLast = i === result.path.length - 1;
    const isArrayIndex = key.startsWith('[');

    if (!current.children) {
      current.children = [];
    }

    let child = current.children.find((c) => c.key === key);

    if (!child) {
      child = {
        key,
        path: result.path.slice(0, i + 1),
        pathKey: result.path.slice(0, i + 1).join('.'),
        changeType: isLast ? result.changeType : 'unchanged',
        fromValue: isLast ? result.fromValue : undefined,
        toValue: isLast ? result.toValue : undefined,
        isArray: isArrayIndex,
        isObject: !isLast,
        displayLabel: keyToDisplayLabel(key),
      };
      current.children.push(child);
    }

    if (isLast) {
      child.changeType = result.changeType;
      child.fromValue = result.fromValue;
      child.toValue = result.toValue;

      // If the leaf value is a complex object, mark it appropriately
      if (result.fromValue !== undefined && typeof result.fromValue === 'object') {
        child.isObject = true;
      }
      if (result.toValue !== undefined && typeof result.toValue === 'object') {
        child.isObject = true;
      }
    }

    current = child;
  }
}

/**
 * Calculate summaries for all nodes in the tree (bottom-up)
 */
function calculateSummaries(node: DiffNode): DiffSummary {
  // Leaf node - return its own change as a summary
  if (!node.children || node.children.length === 0) {
    const summary: DiffSummary = {
      added: node.changeType === 'added' ? 1 : 0,
      removed: node.changeType === 'removed' ? 1 : 0,
      modified: node.changeType === 'modified' ? 1 : 0,
      total: node.changeType !== 'unchanged' ? 1 : 0,
    };
    node.summary = summary;
    return summary;
  }

  // Parent node - aggregate child summaries
  const summary: DiffSummary = { added: 0, removed: 0, modified: 0, total: 0 };

  for (const child of node.children) {
    const childSummary = calculateSummaries(child);
    summary.added += childSummary.added;
    summary.removed += childSummary.removed;
    summary.modified += childSummary.modified;
    summary.total += childSummary.total;
  }

  // Update parent's change type based on children
  if (summary.total > 0 && node.changeType === 'unchanged') {
    node.changeType = 'modified';
  }

  node.summary = summary;
  return summary;
}

/**
 * Sort children: changed nodes first, then alphabetically
 */
function sortChildren(node: DiffNode): void {
  if (!node.children) return;

  node.children.sort((a, b) => {
    // Changed nodes come first
    const aHasChanges = a.summary?.total ?? (a.changeType !== 'unchanged' ? 1 : 0);
    const bHasChanges = b.summary?.total ?? (b.changeType !== 'unchanged' ? 1 : 0);

    if (aHasChanges > 0 && bHasChanges === 0) return -1;
    if (bHasChanges > 0 && aHasChanges === 0) return 1;

    // Then sort alphabetically
    return a.key.localeCompare(b.key);
  });

  // Recursively sort children
  for (const child of node.children) {
    sortChildren(child);
  }
}

/**
 * Build a hierarchical diff tree from two data objects
 */
export function buildDiffTree(
  fromData: unknown,
  toData: unknown,
  options: DiffOptions = {}
): DiffNode[] {
  const diffResults = deepDiff(fromData, toData, options);

  // Build tree structure from flat diff results
  const root: DiffNode = {
    key: 'root',
    path: [],
    pathKey: '',
    changeType: 'unchanged',
    children: [],
  };

  for (const result of diffResults) {
    if (result.path.length > 0) {
      insertDiffResult(root, result);
    }
  }

  // Calculate summaries for all nodes
  calculateSummaries(root);

  // Sort children to show changes first
  sortChildren(root);

  return root.children || [];
}

/**
 * Get all expandable path keys from the tree
 */
export function getAllExpandablePaths(nodes: DiffNode[]): string[] {
  const paths: string[] = [];

  function traverse(nodeList: DiffNode[]) {
    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        paths.push(node.pathKey);
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return paths;
}

/**
 * Get path keys up to a certain depth
 */
export function getPathsToDepth(nodes: DiffNode[], maxDepth: number): string[] {
  const paths: string[] = [];

  function traverse(nodeList: DiffNode[], currentDepth: number) {
    if (currentDepth >= maxDepth) return;

    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        paths.push(node.pathKey);
        traverse(node.children, currentDepth + 1);
      }
    }
  }

  traverse(nodes, 0);
  return paths;
}

/**
 * Get initial expanded paths (expand nodes with changes up to depth 2)
 */
export function getInitialExpandedPaths(nodes: DiffNode[]): Set<string> {
  const paths = new Set<string>();

  function traverse(nodeList: DiffNode[], depth: number) {
    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        // Always expand root level
        if (depth === 0) {
          paths.add(node.pathKey);
        }
        // Expand nodes with changes up to depth 2
        else if (depth < 2 && node.summary && node.summary.total > 0) {
          paths.add(node.pathKey);
        }

        traverse(node.children, depth + 1);
      }
    }
  }

  traverse(nodes, 0);
  return paths;
}
