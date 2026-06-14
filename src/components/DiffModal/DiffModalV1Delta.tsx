import { Fragment, useState, useCallback, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WarningAlt } from '@carbon/icons-react';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';
import type { ChangeType, DiffNode, DiffOptions, Version } from '../../types/diff';
import { useDiffTree } from '../../hooks/useDiffTree';
import { useVersionComparison } from '../../hooks/useVersionComparison';
import { DiffTreeV1Delta } from './DiffTreeV1Delta';
import { VersionSelector } from './VersionSelector';
import fileDocumentIcon from '../../assets/file-document.svg';

/** Output payload emitted by the Generate action — the included delta minus excluded leaves */
export interface GeneratedDelta {
  changes: Array<{
    path: string[];
    pathKey: string;
    changeType: ChangeType;
    fromValue?: unknown;
    toValue?: unknown;
  }>;
  totalIncluded: number;
  excludedPaths: string[];
  /** Target version id when in 'versions' mode */
  targetVersionId?: string;
  /** Target file/source name when in 'upload' mode */
  targetName?: string;
}

function flattenIncludedChanges(nodes: DiffNode[], excluded: Set<string>) {
  const out: GeneratedDelta['changes'] = [];
  const walk = (ns: DiffNode[]) => {
    for (const n of ns) {
      if (n.children && n.children.length > 0) {
        walk(n.children);
      } else if (!excluded.has(n.pathKey)) {
        out.push({
          path: n.path,
          pathKey: n.pathKey,
          changeType: n.changeType,
          fromValue: n.fromValue,
          toValue: n.toValue,
        });
      }
    }
  };
  walk(nodes);
  return out;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface DiffModalV1DeltaProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Comparison mode. 'versions' uses the versions[] list + selector; 'upload' uses fromData/toData and labels them with targetName. */
  mode?: 'versions' | 'upload';
  /** Source data for comparison (required in 'upload' mode) */
  fromData?: Record<string, unknown>;
  /** Target data for comparison (required in 'upload' mode) */
  toData?: Record<string, unknown>;
  /** Display name for the target source in 'upload' mode (e.g. uploaded filename) */
  targetName?: string;
  /** Label for value column (default: "Value") */
  valueLabel?: string;
  /** Versions list (required in 'versions' mode) */
  versions?: Version[];
  /** Initially selected from version (defaults to second version) */
  initialFromVersion?: string;
  /** Initially selected to version (defaults to first version) */
  initialToVersion?: string;
  /** Diff algorithm options */
  diffOptions?: DiffOptions;
  /** Additional CSS classes for the modal */
  className?: string;
  /** Fires when Generate is clicked. Receives the included delta. */
  onGenerate?: (delta: GeneratedDelta) => void;
  /** Label for primary action button (default: "Generate") */
  generateLabel?: string;
}

export function DiffModalV1Delta({
  isOpen,
  onClose,
  title,
  subtitle,
  mode = 'versions',
  fromData: directFromData,
  toData: directToData,
  targetName,
  valueLabel = 'Value',
  versions,
  initialFromVersion,
  initialToVersion,
  diffOptions,
  className = '',
  onGenerate,
  generateLabel = 'Generate',
}: DiffModalV1DeltaProps) {
  // Excluded paths state
  const [excludedPaths, setExcludedPaths] = useState<Set<string>>(new Set());

  // Banner dismissal state
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Toggle exclude for a path
  const toggleExclude = useCallback((pathKey: string) => {
    setExcludedPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) {
        next.delete(pathKey);
      } else {
        next.add(pathKey);
      }
      return next;
    });
  }, []);

  // Toggle exclude for multiple paths
  const toggleExcludeMultiple = useCallback((pathKeys: string[], exclude: boolean) => {
    setExcludedPaths(prev => {
      const next = new Set(prev);
      pathKeys.forEach(pathKey => {
        if (exclude) {
          next.add(pathKey);
        } else {
          next.delete(pathKey);
        }
      });
      return next;
    });
  }, []);

  // Helper to collect all leaf node path keys
  const collectLeafPaths = useCallback((nodes: typeof diffNodes): string[] => {
    const paths: string[] = [];
    const traverse = (nodeList: typeof diffNodes) => {
      for (const node of nodeList) {
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        } else {
          paths.push(node.pathKey);
        }
      }
    };
    traverse(nodes);
    return paths;
  }, []);

  // useVersionComparison only drives the source descriptor + diff in 'versions' mode
  const versionComparison = useVersionComparison(
    mode === 'versions' && versions ? versions : [],
    initialFromVersion,
    initialToVersion
  );

  // Resolve data based on mode
  const fromData = mode === 'versions' ? versionComparison.fromData : directFromData;
  const toData = mode === 'versions' ? versionComparison.toData : directToData;

  const {
    diffNodes,
    expandedPaths,
    toggleExpand,
    expandAll,
    collapseAll,
    totalChanges,
  } = useDiffTree(fromData || {}, toData || {}, diffOptions);

  // Get all leaf paths and calculate exclude states
  const allLeafPaths = useMemo(() => collectLeafPaths(diffNodes), [diffNodes, collectLeafPaths]);
  const allExcluded = allLeafPaths.length > 0 && allLeafPaths.every(path => excludedPaths.has(path));
  const someExcluded = allLeafPaths.some(path => excludedPaths.has(path));

  // Toggle all excludes
  const toggleExcludeAll = useCallback(() => {
    if (allExcluded) {
      // Uncheck all
      setExcludedPaths(new Set());
    } else {
      // Check all
      setExcludedPaths(new Set(allLeafPaths));
    }
  }, [allExcluded, allLeafPaths]);

  // Build subtitle - use provided subtitle or default description
  const versionSubtitle = subtitle || 'Review the changes and generate a delta. Excluded changes will not be included.';

  // Disable Generate when there are no changes or every leaf is excluded
  const generateDisabled = diffNodes.length === 0 || allLeafPaths.length === 0 || allExcluded;

  const handleGenerate = () => {
    if (generateDisabled) return;
    const changes = flattenIncludedChanges(diffNodes, excludedPaths);
    const delta: GeneratedDelta = {
      changes,
      totalIncluded: changes.length,
      excludedPaths: Array.from(excludedPaths),
      targetVersionId: mode === 'versions' ? versionComparison.toVersionId : undefined,
      targetName: mode === 'upload' ? targetName : undefined,
    };
    downloadJson('delta.json', delta);
    onGenerate?.(delta);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-5xl transform overflow-hidden rounded-[8px] bg-white shadow-2xl transition-all ${className}`}
              >
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src={fileDocumentIcon} alt="" className="w-5 h-5" />
                      </div>
                      <div>
                        <Dialog.Title className="text-[18px] font-semibold text-[#32373F] leading-[30px]">
                          {title}
                        </Dialog.Title>
                        {versionSubtitle && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {versionSubtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Source descriptor */}
                  {mode === 'versions' && versions && versions.length > 1 && (
                    <div className="mt-4">
                      <VersionSelector
                        versions={versions}
                        fromVersion={versionComparison.fromVersionId || ''}
                        toVersion={versionComparison.toVersionId || ''}
                        onFromChange={versionComparison.setFromVersionId}
                        onToChange={versionComparison.setToVersionId}
                        disabled
                      />
                    </div>
                  )}
                  {mode === 'upload' && (
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Baseline:</span>
                        <span className="text-sm font-medium text-gray-900">Current configuration</span>
                      </div>
                      <ArrowLongRightIcon className="h-6 w-6 text-[#3560C1]" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Target:</span>
                        <span className="text-sm font-medium text-gray-900">{targetName || 'Uploaded configuration'}</span>
                      </div>
                    </div>
                  )}

                  {/* Simple summary and controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {totalChanges} change{totalChanges !== 1 ? 's' : ''}
                        {excludedPaths.size > 0 && (
                          <span className="text-gray-400"> ({excludedPaths.size} excluded)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={expandAll}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-[#e8e8e8] rounded-[2px] transition-colors"
                        title="Expand all"
                      >
                        <ArrowsPointingOutIcon className="w-4 h-4" />
                        Expand all
                      </button>
                      <button
                        onClick={collapseAll}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-[#e8e8e8] rounded-[2px] transition-colors"
                        title="Collapse all"
                      >
                        <ArrowsPointingInIcon className="w-4 h-4" />
                        Collapse all
                      </button>
                    </div>
                  </div>

                  {/* Info alert banner */}
                  {excludedPaths.size > 0 && !bannerDismissed && (
                    <div className="mt-4 flex items-center gap-3 rounded-[2px] bg-[#FDEED3] p-3">
                      <WarningAlt size={20} className="flex-shrink-0 text-[#FF832B]" />
                      <p className="flex-1 text-sm text-[#32372f]">
                        Excluded changes won't be included in the generated delta.
                      </p>
                      <button
                        onClick={() => setBannerDismissed(true)}
                        className="flex-shrink-0 p-1 hover:bg-[#f5e4c0] rounded transition-colors"
                        aria-label="Dismiss warning"
                      >
                        <XMarkIcon className="h-4 w-4 text-[#32372f]" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-auto bg-white">
                  <DiffTreeV1Delta
                    nodes={diffNodes}
                    expandedPaths={expandedPaths}
                    onToggleExpand={toggleExpand}
                    valueLabel={valueLabel}
                    baselineLabel={mode === 'versions' ? versionComparison.fromVersion?.label : 'Current configuration'}
                    baselineTimestamp={mode === 'versions' ? versionComparison.fromVersion?.timestamp : undefined}
                    versionLabel={mode === 'versions' ? versionComparison.toVersion?.label : targetName}
                    versionTimestamp={mode === 'versions' ? versionComparison.toVersion?.timestamp : undefined}
                    excludedPaths={excludedPaths}
                    onToggleExclude={toggleExclude}
                    onToggleExcludeMultiple={toggleExcludeMultiple}
                    onToggleExcludeAll={toggleExcludeAll}
                    allExcluded={allExcluded}
                    someExcluded={someExcluded}
                  />
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-3 flex justify-end gap-3 bg-[#EDF1F5]">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#d1d1d1] rounded-[2px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generateDisabled}
                    title={generateDisabled ? 'Nothing to generate — the delta is empty.' : undefined}
                    className={`px-4 py-2 text-sm font-medium rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      generateDisabled
                        ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                        : 'text-white bg-[#3560C1] hover:bg-[#2a4fa3]'
                    }`}
                  >
                    {generateLabel}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
