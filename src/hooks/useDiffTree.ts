import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { DiffNode, DiffOptions } from '../types/diff';
import {
  buildDiffTree,
  getAllExpandablePaths,
  getPathsToDepth,
  getInitialExpandedPaths,
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

/**
 * Hook for managing diff tree state including expansion and memoized computation
 */
export function useDiffTree(
  fromData: unknown,
  toData: unknown,
  options: DiffOptions = {}
): UseDiffTreeResult {
  // Memoize diff tree calculation
  const diffNodes = useMemo(
    () => buildDiffTree(fromData, toData, options),
    [fromData, toData, options]
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

  // Track if initial expand has happened
  const hasInitialExpanded = useRef(false);

  // Expand all by default only on initial mount
  useEffect(() => {
    if (!hasInitialExpanded.current && diffNodes.length > 0) {
      const allPaths = getAllExpandablePaths(diffNodes);
      setExpandedPaths(new Set(allPaths));
      hasInitialExpanded.current = true;
    }
  }, [diffNodes]);

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
