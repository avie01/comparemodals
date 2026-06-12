import type { DiffNode } from '../../types/diff';
import { DiffTreeNodeV1RecordMatches } from './DiffTreeNodeV1RecordMatches';
import { formatDate } from '../../utils/diff';

export interface DiffTreeV1RecordMatchesProps {
  /** Root diff nodes to render */
  nodes: DiffNode[];
  /** Set of expanded path keys */
  expandedPaths: Set<string>;
  /** Toggle expansion callback */
  onToggleExpand: (pathKey: string) => void;
  /** Label for value column (default: "Value") */
  valueLabel?: string;
  /** Version label to display in the header */
  versionLabel?: string;
  /** Version timestamp to display in the header */
  versionTimestamp?: Date;
  /** Set of excluded path keys */
  excludedPaths: Set<string>;
  /** Toggle exclude callback */
  onToggleExclude: (pathKey: string) => void;
  /** Toggle exclude for multiple paths callback */
  onToggleExcludeMultiple: (pathKeys: string[], exclude: boolean) => void;
  /** Toggle all excludes callback */
  onToggleExcludeAll: () => void;
  /** Whether all leaf nodes are excluded */
  allExcluded: boolean;
  /** Whether some (but not all) leaf nodes are excluded */
  someExcluded: boolean;
}

export function DiffTreeV1RecordMatches({
  nodes,
  expandedPaths,
  onToggleExpand,
  versionLabel,
  versionTimestamp,
  excludedPaths,
  onToggleExclude,
  onToggleExcludeMultiple,
  onToggleExcludeAll,
  allExcluded,
  someExcluded,
}: DiffTreeV1RecordMatchesProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        No differences found
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Header row - 3 columns */}
      <div className="grid grid-cols-[minmax(300px,1fr)_minmax(200px,1fr)_180px] items-start sticky top-0 bg-white border-b border-[#d1d1d1] z-10">
        <div className="py-3 px-4 font-semibold text-[#707070] text-sm">
          Field
        </div>
        <div className="py-3 px-4 border-l border-[#d1d1d1]">
          {versionLabel && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#1A56DB] bg-[#EDF4FF] px-3 py-1.5 rounded">Target</span>
              <span className="font-semibold text-[#707070] text-sm">{versionLabel}</span>
            </div>
          )}
          {versionTimestamp && <div className="font-normal text-[#707070] text-sm mt-0.5">{formatDate(versionTimestamp)}</div>}
        </div>
        <div className="py-3 px-4 border-l border-[#d1d1d1] flex items-start gap-2 self-stretch">
          <div className="w-4 flex justify-center">
            <input
              type="checkbox"
              checked={allExcluded}
              ref={(el) => {
                if (el) el.indeterminate = someExcluded && !allExcluded;
              }}
              onChange={onToggleExcludeAll}
              className="w-4 h-4 text-[#3560C1] border-gray-300 rounded focus:ring-[#3560C1] cursor-pointer"
              aria-label="Exclude all"
            />
          </div>
          <span className="font-semibold text-[#707070] text-sm">Exclude</span>
        </div>
      </div>

      {/* Tree nodes */}
      <div className="divide-y divide-[#d1d1d1]">
        {nodes.map((node, index) => (
          <DiffTreeNodeV1RecordMatches
            key={node.pathKey}
            node={node}
            depth={0}
            isExpanded={expandedPaths.has(node.pathKey)}
            expandedPaths={expandedPaths}
            onToggle={onToggleExpand}
            isLastChild={index === nodes.length - 1}
            parentLines={[]}
            onToggleExcludeMultiple={onToggleExcludeMultiple}
            excludedPaths={excludedPaths}
            onToggleExclude={onToggleExclude}
          />
        ))}
      </div>
    </div>
  );
}
