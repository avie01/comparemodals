import { ChevronRightIcon } from '@heroicons/react/20/solid';
import type { DiffNode } from '../../types/diff';
import { DiffValueCellV1 } from './DiffValueCellV1';

export interface DiffTreeNodeV1Props {
  /** The diff node data */
  node: DiffNode;
  /** Nesting depth (0 = root level) */
  depth: number;
  /** Whether this node is expanded */
  isExpanded: boolean;
  /** Set of all expanded path keys */
  expandedPaths: Set<string>;
  /** Toggle expansion callback */
  onToggle: (pathKey: string) => void;
  /** Whether this is the last child in parent */
  isLastChild: boolean;
  /** Parent connector line states (true = show line) */
  parentLines: boolean[];
}

export function DiffTreeNodeV1({
  node,
  depth,
  isExpanded,
  expandedPaths,
  onToggle,
  isLastChild,
  parentLines,
}: DiffTreeNodeV1Props) {
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 24;

  const isLeaf = !hasChildren;

  return (
    <>
      {/* Main row - 2 columns: Field | Value */}
      <div
        className={`grid grid-cols-[minmax(300px,1fr)_minmax(200px,1fr)] min-h-[36px] items-center hover:bg-[#e8e8e8] ${hasChildren ? 'bg-[#EDF1F5]' : ''}`}
      >
        {/* Field column */}
        <div className="flex items-center py-2 pr-4" style={{ paddingLeft: `${indent + 12}px` }}>
          <div className="relative flex items-center">
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

            {/* Node label - no summary badge */}
            <span className={hasChildren ? 'text-[#32373F] text-[14px] font-semibold leading-[21px]' : 'text-sm text-gray-900'}>
              {node.displayLabel || node.key}
            </span>
          </div>
        </div>

        {/* Value column (toValue only) */}
        <div className={`py-2 px-4 ${isLeaf ? 'border-l border-[#d1d1d1]' : ''}`}>
          {isLeaf && (
            <DiffValueCellV1
              value={node.toValue}
              changeType={node.changeType}
            />
          )}
        </div>
      </div>

      {/* Children (if expanded) */}
      {hasChildren && isExpanded && node.children && (
        <>
          {node.children.map((child: DiffNode, index: number) => (
            <DiffTreeNodeV1
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
