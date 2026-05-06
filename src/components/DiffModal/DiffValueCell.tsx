import type { DiffValueCellProps } from '../../types/diff';
import { formatValue } from '../../utils/diff';

export function DiffValueCell({
  value,
  changeType,
  column,
  maxLength = 60,
}: DiffValueCellProps) {
  const formatted = formatValue(value, { maxLength });

  // Determine styling based on change type and column
  let cellClasses = 'text-sm';

  if (column === 'from' && changeType === 'removed') {
    cellClasses += ' text-[#A15202] line-through italic';
  } else if (column === 'from' && changeType === 'modified') {
    cellClasses += ' text-[#A15202]';
  } else if (column === 'to' && changeType === 'added') {
    cellClasses += ' text-[#2A7D2A] font-semibold';
  } else if (column === 'to' && changeType === 'modified') {
    cellClasses += ' text-[#2A7D2A] font-semibold';
  }

  // Add any extra classes from the formatter
  if (formatted.className) {
    cellClasses += ` ${formatted.className}`;
  }

  // If there's nothing to show for this column
  if (
    (column === 'from' && changeType === 'added') ||
    (column === 'to' && changeType === 'removed')
  ) {
    return <span className="text-gray-300 italic text-sm">—</span>;
  }

  // Determine prefix/icon for added/removed/modified
  const showPlusPrefix = column === 'to' && (changeType === 'added' || changeType === 'modified');
  const showMinusPrefix = column === 'from' && (changeType === 'removed' || changeType === 'modified');

  return (
    <span className={`${cellClasses} inline-flex items-center gap-1`} title={formatted.tooltip}>
      {showPlusPrefix && '+ '}
      {showMinusPrefix && '- '}
      {formatted.display}
    </span>
  );
}
