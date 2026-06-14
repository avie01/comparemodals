import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/20/solid';
import type { DiffModalProps } from '../../types/diff';
import { useDiffTree } from '../../hooks/useDiffTree';
import { useVersionComparison } from '../../hooks/useVersionComparison';
import { DiffTree } from './DiffTree';
import { VersionSelector } from './VersionSelector';
import { ChangeTypeBadge } from './ChangeTypeBadge';
import { formatDate } from '../../utils/diff';
import fileDocumentIcon from '../../assets/file-document.svg';

export function DiffModal({
  isOpen,
  onClose,
  title,
  subtitle,
  fromData: directFromData,
  toData: directToData,
  fromLabel = 'Baseline',
  toLabel = 'Target',
  versions,
  initialFromVersion,
  initialToVersion,
  diffOptions,
  className = '',
  onRollback,
  rollbackLabel = 'Restore',
}: DiffModalProps) {
  // Version comparison mode (when versions prop is provided)
  const versionComparison = useVersionComparison(
    versions || [],
    initialFromVersion,
    initialToVersion
  );

  // Determine which data to use
  const fromData = versions ? versionComparison.fromData : directFromData;
  const toData = versions ? versionComparison.toData : directToData;

  // Build diff tree
  const {
    diffNodes,
    expandedPaths,
    toggleExpand,
    expandAll,
    collapseAll,
    totalChanges,
    changeSummary,
  } = useDiffTree(fromData || {}, toData || {}, diffOptions);

  // Build subtitle from version info
  const versionSubtitle = versions && versionComparison.toVersion
    ? `${formatDate(versionComparison.toVersion.timestamp)} - ${versionComparison.toVersion.author || 'Unknown'} - ${versionComparison.toVersion.id}`
    : subtitle;

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

                  {/* Summary bar */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {totalChanges} change{totalChanges !== 1 ? 's' : ''}:
                      </span>
                      {changeSummary.added > 0 && (
                        <ChangeTypeBadge type="added" count={changeSummary.added} variant="pill" />
                      )}
                      {changeSummary.modified > 0 && (
                        <ChangeTypeBadge type="modified" count={changeSummary.modified} variant="pill" />
                      )}
                      {changeSummary.removed > 0 && (
                        <ChangeTypeBadge type="removed" count={changeSummary.removed} variant="pill" />
                      )}
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
                  <DiffTree
                    nodes={diffNodes}
                    expandedPaths={expandedPaths}
                    onToggleExpand={toggleExpand}
                    fromLabel={fromLabel}
                    toLabel={toLabel}
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
                  {onRollback && (
                    <button
                      onClick={() => onRollback(versionComparison.fromVersionId || '')}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#3560C1] rounded-[2px] hover:bg-[#2a4fa3] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
