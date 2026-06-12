import type { ChangeType } from '../../types/diff';
import { formatValue } from '../../utils/diff';

export interface DiffValueCellV1Props {
  /** Value to display */
  value: unknown;
  /** Type of change (used only for determining empty state) */
  changeType: ChangeType;
  /** Max length before truncation */
  maxLength?: number;
  /** When true, render the value as excluded (red + italic) */
  excluded?: boolean;
}

export function DiffValueCellV1({
  value,
  changeType,
  maxLength = 60,
  excluded = false,
}: DiffValueCellV1Props) {
  const formatted = formatValue(value, { maxLength });

  // Show dash for removed items (no value to display)
  if (changeType === 'removed') {
    return (
      <span className={excluded ? 'text-[#D0000A] text-sm italic' : 'text-gray-400 text-sm'}>—</span>
    );
  }

  return (
    <span
      className={`text-sm ${excluded ? 'text-[#D0000A] italic' : 'text-gray-900'}`}
      title={formatted.tooltip}
    >
      {formatted.display}
    </span>
  );
}
