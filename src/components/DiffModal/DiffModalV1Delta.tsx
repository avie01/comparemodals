import { Fragment, useState, useCallback, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WarningAlt } from '@carbon/icons-react';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/20/solid';
import type { DiffOptions, Version } from '../../types/diff';
import { useDiffTree } from '../../hooks/useDiffTree';
import { useVersionComparison } from '../../hooks/useVersionComparison';
import { DiffTreeV1Delta } from './DiffTreeV1Delta';
import { VersionSelector } from './VersionSelector';
import fileDocumentIcon from '../../assets/file-document.svg';

export interface DiffModalV1DeltaProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Source data for comparison (used when versions not provided) */
  fromData?: Record<string, unknown>;
  /** Target data for comparison (used when versions not provided) */
  toData?: Record<string, unknown>;
  /** Label for value column (default: "Value") */
  valueLabel?: string;
  /** Enable version selector mode with list of versions */
  versions?: Version[];
  /** Initially selected from version (defaults to second version) */
  initialFromVersion?: string;
  /** Initially selected to version (defaults to first version) */
  initialToVersion?: string;
  /** Diff algorithm options */
  diffOptions?: DiffOptions;
  /** Additional CSS classes for the modal */
  className?: string;
  /** Callback when rollback is clicked (receives version ID and excluded paths) */
  onRollback?: (versionId: string, excludedPaths: string[]) => void;
  /** Label for rollback button */
  rollbackLabel?: string;
}

export function DiffModalV1Delta({
  isOpen,
  onClose,
  title,
  subtitle,
  fromData: directFromData,
  toData: directToData,
  valueLabel = 'Value',
  versions,
  initialFromVersion,
  initialToVersion,
  diffOptions,
  className = '',
  onRollback,
  rollbackLabel = 'Roll back',
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

  // Version comparison mode (when versions prop is provided)
  const versionComparison = useVersionComparison(
    versions || [],
    initialFromVersion,
    initialToVersion
  );

  // Determine which data to use
  const fromData = versions ? versionComparison.fromData : directFromData;
  const toData = versions ? versionComparison.toData : directToData;

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
  const versionSubtitle = subtitle || (versions ? 'Review the delta changes and exclude any values you do not want to roll back' : undefined);

  // Handle rollback with excluded paths
  const handleRollback = () => {
    if (onRollback && versionComparison.toVersionId) {
      onRollback(versionComparison.toVersionId, Array.from(excludedPaths));
    }
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

                  {/* Version selector (if versions provided) */}
                  {versions && versions.length > 1 && (
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
                        Excluding changes from the referenced configuration may cause issues. Please take careful consideration when excluding changes.
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
                    versionLabel={versionComparison.toVersion?.label}
                    versionTimestamp={versionComparison.toVersion?.timestamp}
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
                  {onRollback && versionComparison.toVersionId && (
                    <button
                      onClick={handleRollback}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#3560C1] rounded-[2px] hover:bg-[#2a4fa3] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {rollbackLabel}{versionComparison.toVersion?.label ? ` to ${versionComparison.toVersion.label}` : ''}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
