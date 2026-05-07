import type { ChangeType } from '../../types/diff';
import { formatValue } from '../../utils/diff';

export interface DiffValueCellV1Props {
  /** Value to display */
  value: unknown;
  /** Type of change (used only for determining empty state) */
  changeType: ChangeType;
  /** Max length before truncation */
  maxLength?: number;
}

export function DiffValueCellV1({
  value,
  changeType,
  maxLength = 60,
}: DiffValueCellV1Props) {
  const formatted = formatValue(value, { maxLength });

  // Show dash for removed items (no value to display)
  if (changeType === 'removed') {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  return (
    <span className="text-sm text-gray-900" title={formatted.tooltip}>
      {formatted.display}
    </span>
  );
}
