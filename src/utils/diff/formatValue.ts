/**
 * Result of formatting a value for display
 */
export interface FormattedValue {
  /** The display string */
  display: string;
  /** Whether the value is a complex type (object/array) */
  isComplex: boolean;
  /** Full value for tooltip (if truncated) */
  tooltip?: string;
  /** CSS class hints based on value type */
  className?: string;
}

/**
 * Format a value for display in the diff viewer
 */
export function formatValue(
  value: unknown,
  options: { maxLength?: number } = {}
): FormattedValue {
  const maxLength = options.maxLength ?? 50;

  if (value === null) {
    return {
      display: 'null',
      isComplex: false,
      className: 'italic text-gray-400',
    };
  }

  if (value === undefined) {
    return {
      display: '—',
      isComplex: false,
      className: 'italic text-gray-400',
    };
  }

  if (typeof value === 'boolean') {
    return {
      display: value ? 'True' : 'False',
      isComplex: false,
      className: value ? 'text-[#2A7D2A]' : 'text-gray-500',
    };
  }

  if (typeof value === 'number') {
    return {
      display: String(value),
      isComplex: false,
      className: 'font-mono',
    };
  }

  if (typeof value === 'string') {
    if (value === '') {
      return {
        display: '(empty)',
        isComplex: false,
        className: 'italic text-gray-400',
      };
    }

    if (value.length > maxLength) {
      return {
        display: `${value.slice(0, maxLength)}...`,
        isComplex: false,
        tooltip: value,
      };
    }

    return {
      display: value,
      isComplex: false,
    };
  }

  if (Array.isArray(value)) {
    const count = value.length;
    return {
      display: `[${count} item${count !== 1 ? 's' : ''}]`,
      isComplex: true,
      className: 'text-gray-500 italic',
    };
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const count = keys.length;
    return {
      display: `{${count} field${count !== 1 ? 's' : ''}}`,
      isComplex: true,
      className: 'text-gray-500 italic',
    };
  }

  return {
    display: String(value),
    isComplex: false,
  };
}

/**
 * Format a date value for display
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return String(date);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
