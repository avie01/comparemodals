import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/20/solid';
import type { DiffOptions, Version, BreakingChange } from '../../types/diff';
import alertIcon from '../../assets/alert.svg';
import { useDiffTree } from '../../hooks/useDiffTree';
import { useVersionComparison } from '../../hooks/useVersionComparison';
import { DiffTreeV1 } from './DiffTreeV1';
import { VersionSelector } from './VersionSelector';
import fileDocumentIcon from '../../assets/file-document.svg';

export interface DiffModalV1Props {
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
  /** Callback when rollback is clicked (receives version ID) */
  onRollback?: (versionId: string) => void;
  /** Label for rollback button */
  rollbackLabel?: string;
  /** Breaking changes that prevent rollback */
  breakingChanges?: BreakingChange[];
  /** Whether to expand all nodes by default (default: true) */
  initiallyExpanded?: boolean;
}

export function DiffModalV1({
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
  rollbackLabel = 'Restore',
  breakingChanges = [],
  initiallyExpanded = true,
}: DiffModalV1Props) {
  const hasBreakingChanges = breakingChanges.length > 0;
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
  } = useDiffTree(fromData || {}, toData || {}, { ...diffOptions, initiallyExpanded });

  // Build subtitle - use provided subtitle or default description
  const versionSubtitle = subtitle || (versions ? 'This shows the difference between these configurations versions' : undefined);

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
                      />
                    </div>
                  )}

                  {/* Error banner for breaking changes */}
                  {hasBreakingChanges && (
                    <div className="mt-4 rounded-[2px] bg-[#F7E4E6] p-4">
                      <div className="flex items-start gap-3">
                        <img src={alertIcon} alt="" className="flex-shrink-0 w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[#32373F] mb-2">
                            Unable to roll back due to breaking changes
                          </h4>
                          <p className="text-sm text-[#161616] mb-3">
                            The following record types have dependencies that must be deleted before this rollback can be completed:
                          </p>
                          <ul className="space-y-2">
                            {breakingChanges.map((change, index) => (
                              <li key={index} className="text-sm text-[#161616]">
                                <div className="flex items-start gap-2">
                                  <span className="font-medium">{change.recordType}</span>
                                  <span className="text-gray-500">({change.count} record{change.count !== 1 ? 's' : ''})</span>
                                </div>
                                <p className="text-gray-600 mt-0.5 ml-0">{change.reason}</p>
                                {change.details && change.details.length > 0 && (
                                  <ul className="mt-1 ml-4 list-disc text-gray-500">
                                    {change.details.map((detail, detailIndex) => (
                                      <li key={detailIndex}>{detail}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simple summary and controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {totalChanges} change{totalChanges !== 1 ? 's' : ''}
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
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-auto bg-white">
                  <DiffTreeV1
                    nodes={diffNodes}
                    expandedPaths={expandedPaths}
                    onToggleExpand={toggleExpand}
                    valueLabel={valueLabel}
                    versionLabel={versionComparison.toVersion?.label}
                    versionTimestamp={versionComparison.toVersion?.timestamp}
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
                      onClick={() => onRollback(versionComparison.toVersionId!)}
                      disabled={hasBreakingChanges}
                      className={`px-4 py-2 text-sm font-medium rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        hasBreakingChanges
                          ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                          : 'text-white bg-[#3560C1] hover:bg-[#2a4fa3]'
                      }`}
                    >
                      {rollbackLabel}
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
