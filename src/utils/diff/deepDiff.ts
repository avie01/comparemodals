import type { ChangeType, DiffOptions } from '../../types/diff';

/**
 * Represents a single difference found during comparison
 */
export interface DiffResult {
  path: string[];
  changeType: ChangeType;
  fromValue?: unknown;
  toValue?: unknown;
}

/**
 * Check if a value is a plain object (not null, array, or other types)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Compare two arrays and return differences
 */
function diffArrays(
  fromArr: unknown[],
  toArr: unknown[],
  options: DiffOptions,
  currentPath: string[],
  currentDepth: number
): DiffResult[] {
  const results: DiffResult[] = [];
  const { arrayMatchKey } = options;

  // If we have a match key and both arrays contain objects, try to match by key
  if (arrayMatchKey && fromArr.every(isPlainObject) && toArr.every(isPlainObject)) {
    const fromMap = new Map<string, Record<string, unknown>>();
    const toMap = new Map<string, Record<string, unknown>>();

    fromArr.forEach((item) => {
      const obj = item as Record<string, unknown>;
      const key = String(obj[arrayMatchKey] ?? '');
      if (key) fromMap.set(key, obj);
    });

    toArr.forEach((item) => {
      const obj = item as Record<string, unknown>;
      const key = String(obj[arrayMatchKey] ?? '');
      if (key) toMap.set(key, obj);
    });

    // Find removed items
    for (const [key, fromItem] of fromMap) {
      const childPath = [...currentPath, `[${key}]`];
      if (!toMap.has(key)) {
        results.push({ path: childPath, changeType: 'removed', fromValue: fromItem });
      } else {
        // Item exists in both - compare recursively
        const toItem = toMap.get(key)!;
        results.push(...deepDiff(fromItem, toItem, options, childPath, currentDepth + 1));
      }
    }

    // Find added items
    for (const [key, toItem] of toMap) {
      if (!fromMap.has(key)) {
        const childPath = [...currentPath, `[${key}]`];
        results.push({ path: childPath, changeType: 'added', toValue: toItem });
      }
    }

    return results;
  }

  // Default: compare by index
  const maxLen = Math.max(fromArr.length, toArr.length);

  for (let i = 0; i < maxLen; i++) {
    const childPath = [...currentPath, `[${i}]`];

    if (i >= fromArr.length) {
      results.push({ path: childPath, changeType: 'added', toValue: toArr[i] });
    } else if (i >= toArr.length) {
      results.push({ path: childPath, changeType: 'removed', fromValue: fromArr[i] });
    } else {
      results.push(...deepDiff(fromArr[i], toArr[i], options, childPath, currentDepth + 1));
    }
  }

  return results;
}

/**
 * Compare two objects and return differences
 */
function diffObjects(
  fromObj: Record<string, unknown>,
  toObj: Record<string, unknown>,
  options: DiffOptions,
  currentPath: string[],
  currentDepth: number
): DiffResult[] {
  const results: DiffResult[] = [];
  const allKeys = new Set([...Object.keys(fromObj), ...Object.keys(toObj)]);

  for (const key of allKeys) {
    const childPath = [...currentPath, key];
    const hasFrom = key in fromObj;
    const hasTo = key in toObj;

    if (!hasFrom) {
      results.push({ path: childPath, changeType: 'added', toValue: toObj[key] });
    } else if (!hasTo) {
      results.push({ path: childPath, changeType: 'removed', fromValue: fromObj[key] });
    } else {
      results.push(...deepDiff(fromObj[key], toObj[key], options, childPath, currentDepth + 1));
    }
  }

  return results;
}

/**
 * Deep diff algorithm - compares two values recursively and returns all differences
 */
export function deepDiff(
  fromValue: unknown,
  toValue: unknown,
  options: DiffOptions = {},
  currentPath: string[] = [],
  currentDepth: number = 0
): DiffResult[] {
  const { includeUnchanged = false, maxDepth = -1 } = options;

  // Check max depth
  if (maxDepth !== -1 && currentDepth > maxDepth) {
    if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
      return [{
        path: currentPath,
        changeType: 'modified',
        fromValue,
        toValue
      }];
    }
    return includeUnchanged ? [{ path: currentPath, changeType: 'unchanged', fromValue, toValue }] : [];
  }

  // Handle null/undefined
  if (fromValue === null || fromValue === undefined) {
    if (toValue === null || toValue === undefined) {
      return includeUnchanged ? [{ path: currentPath, changeType: 'unchanged', fromValue, toValue }] : [];
    }
    return [{ path: currentPath, changeType: 'added', toValue }];
  }

  if (toValue === null || toValue === undefined) {
    return [{ path: currentPath, changeType: 'removed', fromValue }];
  }

  // Handle type mismatch
  const fromType = Array.isArray(fromValue) ? 'array' : typeof fromValue;
  const toType = Array.isArray(toValue) ? 'array' : typeof toValue;

  if (fromType !== toType) {
    return [{
      path: currentPath,
      changeType: 'modified',
      fromValue,
      toValue
    }];
  }

  // Handle primitives
  if (typeof fromValue !== 'object') {
    if (fromValue === toValue) {
      return includeUnchanged ? [{ path: currentPath, changeType: 'unchanged', fromValue, toValue }] : [];
    }
    return [{
      path: currentPath,
      changeType: 'modified',
      fromValue,
      toValue
    }];
  }

  // Handle arrays
  if (Array.isArray(fromValue) && Array.isArray(toValue)) {
    return diffArrays(fromValue, toValue, options, currentPath, currentDepth);
  }

  // Handle objects
  if (isPlainObject(fromValue) && isPlainObject(toValue)) {
    return diffObjects(fromValue, toValue, options, currentPath, currentDepth);
  }

  // Fallback for other object types (Date, etc.)
  if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
    return [{
      path: currentPath,
      changeType: 'modified',
      fromValue,
      toValue
    }];
  }

  return includeUnchanged ? [{ path: currentPath, changeType: 'unchanged', fromValue, toValue }] : [];
}
