import type { ChangeTypeBadgeProps } from '../../types/diff';

const badgeStyles = {
  added: {
    pill: 'bg-green-100 text-green-700 border-green-200',
    text: 'text-[#2A7D2A]',
    dot: 'bg-green-500',
  },
  removed: {
    pill: 'bg-red-100 text-red-700 border-red-200',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
  modified: {
    pill: 'bg-green-100 text-[#2A7D2A] border-green-200',
    text: 'text-[#2A7D2A]',
    dot: 'bg-[#2A7D2A]',
  },
  unchanged: {
    pill: 'bg-gray-100 text-gray-500 border-gray-200',
    text: 'text-gray-400',
    dot: 'bg-gray-300',
  },
};

const labels = {
  added: 'Added',
  removed: 'Removed',
  modified: 'Modified',
  unchanged: 'Unchanged',
};

export function ChangeTypeBadge({
  type,
  count,
  variant = 'pill',
  size = 'sm',
}: ChangeTypeBadgeProps) {
  if (type === 'unchanged') return null;

  const styles = badgeStyles[type];
  const label = labels[type];
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  if (variant === 'dot') {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${styles.dot}`}
        title={label}
      />
    );
  }

  if (variant === 'text') {
    return (
      <span className={`${styles.text} ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
        {count !== undefined ? `${count} ${label.toLowerCase()}` : label}
      </span>
    );
  }

  // pill variant
  const icon = type === 'added' ? (
    <span className="font-bold">+</span>
  ) : type === 'removed' ? (
    <span className="font-bold">−</span>
  ) : type === 'modified' ? (
    <span className="font-bold">+</span>
  ) : null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[2px] border font-medium ${styles.pill} ${sizeClasses}`}
    >
      {icon}
      {count !== undefined ? `${count} ${label}` : label}
    </span>
  );
}
