import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/20/solid';
import type { DiffOptions } from '../../types/diff';
import { useDiffTree } from '../../hooks/useDiffTree';
import { DiffTreeV1 } from './DiffTreeV1';
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
  /** Source data for comparison */
  fromData?: Record<string, unknown>;
  /** Target data for comparison (this is what gets displayed) */
  toData?: Record<string, unknown>;
  /** Label for value column (default: "Value") */
  valueLabel?: string;
  /** Diff algorithm options */
  diffOptions?: DiffOptions;
  /** Additional CSS classes for the modal */
  className?: string;
  /** Callback when primary action button is clicked */
  onConfirm?: () => void;
  /** Label for confirm button (default: "Confirm") */
  confirmLabel?: string;
}

export function DiffModalV1({
  isOpen,
  onClose,
  title,
  subtitle,
  fromData,
  toData,
  valueLabel = 'Value',
  diffOptions,
  className = '',
  onConfirm,
  confirmLabel = 'Confirm',
}: DiffModalV1Props) {
  const {
    diffNodes,
    expandedPaths,
    toggleExpand,
    expandAll,
    collapseAll,
    totalChanges,
  } = useDiffTree(fromData || {}, toData || {}, diffOptions);

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
                        {subtitle && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {subtitle}
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
                  {onConfirm && (
                    <button
                      onClick={onConfirm}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#3560C1] rounded-[2px] hover:bg-[#2a4fa3] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {confirmLabel}
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
