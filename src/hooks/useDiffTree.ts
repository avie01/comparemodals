import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { DiffNode, DiffOptions } from '../types/diff';
import {
  buildDiffTree,
  getAllExpandablePaths,
  getPathsToDepth,
} from '../utils/diff';

export interface UseDiffTreeResult {
  /** The computed diff tree nodes */
  diffNodes: DiffNode[];
  /** Set of currently expanded path keys */
  expandedPaths: Set<string>;
  /** Toggle a single node's expansion */
  toggleExpand: (pathKey: string) => void;
  /** Expand all expandable nodes */
  expandAll: () => void;
  /** Collapse all nodes */
  collapseAll: () => void;
  /** Expand nodes up to a certain depth */
  expandToDepth: (depth: number) => void;
  /** Check if a path is expanded */
  isExpanded: (pathKey: string) => boolean;
  /** Total number of changes */
  totalChanges: number;
  /** Summary of changes by type */
  changeSummary: { added: number; removed: number; modified: number };
}

export interface UseDiffTreeOptions extends DiffOptions {
  /** Whether to expand all nodes by default (default: true) */
  initiallyExpanded?: boolean;
}

/**
 * Hook for managing diff tree state including expansion and memoized computation
 */
export function useDiffTree(
  fromData: unknown,
  toData: unknown,
  options: UseDiffTreeOptions = {}
): UseDiffTreeResult {
  const { initiallyExpanded = true, ...diffOptions } = options;
  // Memoize diff tree calculation
  const diffNodes = useMemo(
    () => buildDiffTree(fromData, toData, diffOptions),
    [fromData, toData, diffOptions]
  );

  // Calculate change summary
  const changeSummary = useMemo(() => {
    let added = 0;
    let removed = 0;
    let modified = 0;

    function countChanges(nodes: DiffNode[]) {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          countChanges(node.children);
        } else {
          if (node.changeType === 'added') added++;
          else if (node.changeType === 'removed') removed++;
          else if (node.changeType === 'modified') modified++;
        }
      }
    }

    countChanges(diffNodes);
    return { added, removed, modified };
  }, [diffNodes]);

  const totalChanges = changeSummary.added + changeSummary.removed + changeSummary.modified;

  // Track expanded paths
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Signature of the tree we last applied the default expansion to. Re-applying
  // when this changes means a new tree (e.g. switching versions/data) re-expands
  // to the default view, while re-renders of the same tree keep manual toggles.
  const expandedSignatureRef = useRef<string | null>(null);

  // Apply default expansion whenever the underlying tree changes
  useEffect(() => {
    if (diffNodes.length === 0) return;

    const expandablePaths = getAllExpandablePaths(diffNodes);
    const signature = expandablePaths.join('|');
    if (expandedSignatureRef.current === signature) return;

    if (initiallyExpanded) {
      setExpandedPaths(new Set(expandablePaths));
    }
    expandedSignatureRef.current = signature;
  }, [diffNodes, initiallyExpanded]);

  const toggleExpand = useCallback((pathKey: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) {
        next.delete(pathKey);
      } else {
        next.add(pathKey);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allPaths = getAllExpandablePaths(diffNodes);
    setExpandedPaths(new Set(allPaths));
  }, [diffNodes]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const expandToDepth = useCallback(
    (depth: number) => {
      const paths = getPathsToDepth(diffNodes, depth);
      setExpandedPaths(new Set(paths));
    },
    [diffNodes]
  );

  const isExpanded = useCallback(
    (pathKey: string) => expandedPaths.has(pathKey),
    [expandedPaths]
  );

  return {
    diffNodes,
    expandedPaths,
    toggleExpand,
    expandAll,
    collapseAll,
    expandToDepth,
    isExpanded,
    totalChanges,
    changeSummary,
  };
}
