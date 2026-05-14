import type { DiffNode } from '../../types/diff';
import { DiffTreeNodeV1 } from './DiffTreeNodeV1';
import { formatDate } from '../../utils/diff';

export interface DiffTreeV1Props {
  /** Root diff nodes to render */
  nodes: DiffNode[];
  /** Set of expanded path keys */
  expandedPaths: Set<string>;
  /** Toggle expansion callback */
  onToggleExpand: (pathKey: string) => void;
  /** Label for value column (default: "Value") */
  valueLabel?: string;
  /** Version label to display above the value label */
  versionLabel?: string;
  /** Version timestamp to display in the header */
  versionTimestamp?: Date;
}

export function DiffTreeV1({
  nodes,
  expandedPaths,
  onToggleExpand,
  valueLabel = 'Value',
  versionLabel,
  versionTimestamp,
}: DiffTreeV1Props) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        No differences found
      </div>
    );
  }

  return (
    <div>
      {/* Header row - 2 columns */}
      <div className="grid grid-cols-[minmax(300px,1fr)_minmax(200px,1fr)] sticky top-0 bg-white border-b border-[#d1d1d1] z-10">
        <div className="py-3 px-4 font-semibold text-[#707070] text-sm">
          Field
        </div>
        <div className="py-3 px-4 border-l border-[#d1d1d1]">
          {versionLabel && <div className="font-semibold text-[#707070] text-sm">Values for {versionLabel}</div>}
          {versionTimestamp && <div className="font-normal text-[#707070] text-sm">{formatDate(versionTimestamp)}</div>}
        </div>
      </div>

      {/* Tree nodes */}
      <div className="divide-y divide-[#d1d1d1]">
        {nodes.map((node, index) => (
          <DiffTreeNodeV1
            key={node.pathKey}
            node={node}
            depth={0}
            isExpanded={expandedPaths.has(node.pathKey)}
            expandedPaths={expandedPaths}
            onToggle={onToggleExpand}
            isLastChild={index === nodes.length - 1}
            parentLines={[]}
          />
        ))}
      </div>
    </div>
  );
}
