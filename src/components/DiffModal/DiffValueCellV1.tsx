import type { ChangeType } from '../../types/diff';
import { formatValue } from '../../utils/diff';

export interface DiffValueCellV1Props {
  /** Value to display */
  value: unknown;
  /** Type of change (used to decide when the cell should render the empty dash) */
  changeType: ChangeType;
  /** Which column this cell renders in. 'from' shows — for added rows; 'to' shows — for removed rows. Defaults to 'to' for back-compat. */
  column?: 'from' | 'to';
  /** Max length before truncation */
  maxLength?: number;
  /** When true, render the value as excluded (red + italic) */
  excluded?: boolean;
}

export function DiffValueCellV1({
  value,
  changeType,
  column = 'to',
  maxLength = 60,
  excluded = false,
}: DiffValueCellV1Props) {
  const formatted = formatValue(value, { maxLength });

  const isEmpty =
    (column === 'from' && changeType === 'added') ||
    (column === 'to' && changeType === 'removed');

  if (isEmpty) {
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
