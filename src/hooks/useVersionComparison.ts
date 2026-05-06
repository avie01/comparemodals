import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Version } from '../types/diff';

export type ComparisonMode = 'summary' | 'compare';

export interface UseVersionComparisonResult {
  /** Current comparison mode */
  mode: ComparisonMode;
  /** Set the comparison mode */
  setMode: (mode: ComparisonMode) => void;
  /** Selected from version ID */
  fromVersionId: string | undefined;
  /** Set the from version ID */
  setFromVersionId: (id: string) => void;
  /** Selected to version ID */
  toVersionId: string | undefined;
  /** Set the to version ID */
  setToVersionId: (id: string) => void;
  /** The from version data (resolved) */
  fromData: Record<string, unknown> | undefined;
  /** The to version data (resolved) */
  toData: Record<string, unknown> | undefined;
  /** The from version object (resolved) */
  fromVersion: Version | undefined;
  /** The to version object (resolved) */
  toVersion: Version | undefined;
  /** Whether comparison is valid (two different versions selected) */
  isValid: boolean;
  /** Swap from and to versions */
  swapVersions: () => void;
}

/**
 * Hook for managing version selection and comparison mode
 */
export function useVersionComparison(
  versions: Version[],
  initialFromId?: string,
  initialToId?: string
): UseVersionComparisonResult {
  const [mode, setMode] = useState<ComparisonMode>('compare');
  const [fromVersionId, setFromVersionId] = useState<string | undefined>(initialFromId);
  const [toVersionId, setToVersionId] = useState<string | undefined>(initialToId);

  // In summary mode, auto-select latest version and its predecessor
  useEffect(() => {
    if (versions.length === 0) return;

    if (mode === 'summary' && versions.length >= 2) {
      // Assume versions are sorted newest first
      setToVersionId(versions[0].id);
      setFromVersionId(versions[1].id);
    } else if (mode === 'summary' && versions.length === 1) {
      // Only one version - can't compare
      setToVersionId(versions[0].id);
      setFromVersionId(undefined);
    }
  }, [mode, versions]);

  // Initialize versions on mount if not set
  useEffect(() => {
    if (versions.length >= 2 && !fromVersionId && !toVersionId) {
      setToVersionId(versions[0].id);
      setFromVersionId(versions[1].id);
    } else if (versions.length === 1 && !toVersionId) {
      setToVersionId(versions[0].id);
    }
  }, [versions, fromVersionId, toVersionId]);

  const fromData = useMemo(
    () => versions.find((v) => v.id === fromVersionId)?.data,
    [versions, fromVersionId]
  );

  const toData = useMemo(
    () => versions.find((v) => v.id === toVersionId)?.data,
    [versions, toVersionId]
  );

  const fromVersion = useMemo(
    () => versions.find((v) => v.id === fromVersionId),
    [versions, fromVersionId]
  );

  const toVersion = useMemo(
    () => versions.find((v) => v.id === toVersionId),
    [versions, toVersionId]
  );

  const isValid = useMemo(
    () =>
      fromVersionId !== undefined &&
      toVersionId !== undefined &&
      fromVersionId !== toVersionId &&
      fromData !== undefined &&
      toData !== undefined,
    [fromVersionId, toVersionId, fromData, toData]
  );

  const swapVersions = useCallback(() => {
    const tempFrom = fromVersionId;
    setFromVersionId(toVersionId);
    setToVersionId(tempFrom);
  }, [fromVersionId, toVersionId]);

  return {
    mode,
    setMode,
    fromVersionId,
    setFromVersionId,
    toVersionId,
    setToVersionId,
    fromData,
    toData,
    fromVersion,
    toVersion,
    isValid,
    swapVersions,
  };
}
