import { ChevronRightIcon } from '@heroicons/react/20/solid';
import type { DiffTreeNodeProps, DiffNode } from '../../types/diff';
import { DiffValueCell } from './DiffValueCell';

const rowStyles = {
  added: '',
  removed: '',
  modified: '',
  unchanged: '',
};

function formatSummary(summary: { added: number; removed: number; modified: number; total: number }): string {
  const parts: string[] = [];
  if (summary.added > 0) parts.push(`${summary.added} new`);
  if (summary.modified > 0) parts.push(`${summary.modified} updated`);
  if (summary.removed > 0) parts.push(`${summary.removed} removed`);
  return parts.length > 0 ? `[${parts.join(', ')}]` : '';
}

export function DiffTreeNode({
  node,
  depth,
  isExpanded,
  expandedPaths,
  onToggle,
  isLastChild,
  parentLines,
}: DiffTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 24; // 24px per level

  // Determine if this is a leaf node (shows values) or parent node (expandable)
  const isLeaf = !hasChildren;

  return (
    <>
      {/* Main row */}
      <div
        className={`grid grid-cols-[minmax(300px,1fr)_minmax(200px,1fr)_minmax(200px,1fr)] min-h-[36px] items-center hover:bg-[#e8e8e8] ${hasChildren ? 'bg-[#EDF1F5]' : ''} ${rowStyles[node.changeType]}`}
      >
        {/* Field column */}
        <div className="flex items-center py-2 pr-4" style={{ paddingLeft: `${indent + 12}px` }}>
          <div className="relative flex items-center">
            {/* Expand/collapse button or spacer */}
            {hasChildren ? (
              <button
                onClick={() => onToggle(node.pathKey)}
                className="flex items-center justify-center w-5 h-5 mr-1 rounded hover:bg-gray-200 transition-colors"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronRightIcon
                  className={`w-[20px] h-[20px] text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span className="w-5 mr-1" />
            )}

            {/* Node label */}
            <span className={hasChildren ? 'text-[#32373F] text-[14px] font-semibold leading-[21px]' : 'text-sm text-gray-900'}>
              {node.displayLabel || node.key}
            </span>

            {/* Summary badge for collapsed parent nodes */}
            {hasChildren && !isExpanded && node.summary && node.summary.total > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                {formatSummary(node.summary)}
              </span>
            )}
          </div>
        </div>

        {/* From Value column */}
        <div className={`py-2 px-4 ${isLeaf ? 'border-l border-[#d1d1d1]' : ''}`}>
          {isLeaf && (
            <DiffValueCell
              value={node.fromValue}
              changeType={node.changeType}
              column="from"
            />
          )}
        </div>

        {/* To Value column */}
        <div className={`py-2 px-4 ${isLeaf ? 'border-l border-[#d1d1d1]' : ''}`}>
          {isLeaf && (
            <DiffValueCell
              value={node.toValue}
              changeType={node.changeType}
              column="to"
            />
          )}
        </div>
      </div>

      {/* Children (if expanded) */}
      {hasChildren && isExpanded && node.children && (
        <>
          {node.children.map((child: DiffNode, index: number) => (
            <DiffTreeNode
              key={child.pathKey}
              node={child}
              depth={depth + 1}
              isExpanded={expandedPaths.has(child.pathKey)}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              isLastChild={index === node.children!.length - 1}
              parentLines={[...parentLines, !isLastChild]}
            />
          ))}
        </>
      )}
    </>
  );
}
