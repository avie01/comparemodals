import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ArrowsRightLeftIcon, ArrowLongRightIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import type { VersionSelectorProps } from '../../types/diff';
import { formatDate } from '../../utils/diff';
import chevronDown from '../../assets/navigation-chevron-down.svg';

export function VersionSelector({
  versions,
  fromVersion,
  toVersion,
  onFromChange,
  onToChange,
  disabled = false,
}: VersionSelectorProps & { disabled?: boolean }) {
  const fromVersionObj = versions.find((v) => v.id === fromVersion);
  const toVersionObj = versions.find((v) => v.id === toVersion);

  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const showTooltip = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
  };
  const hideTooltip = () => setTooltipPos(null);

  const handleSwap = () => {
    onFromChange(toVersion);
    onToChange(fromVersion);
  };

  // Render simple labels when disabled
  if (disabled) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Current version */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Current:</span>
            <span className="text-sm font-medium text-gray-900">{fromVersionObj?.label || 'Current configuration'}</span>
          </div>

          <ArrowLongRightIcon className="h-6 w-6 text-[#3560C1]" />

          {/* Target version (rolling back to) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Target:</span>
            <span className="text-sm font-medium text-gray-900">{toVersionObj?.label || 'Select version'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Version selectors */}
      <div className="flex items-center gap-2">
          {/* From version */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Current:</span>
            <Listbox value={fromVersion} onChange={onFromChange}>
              <div className="relative">
                <Listbox.Button className="relative w-48 cursor-pointer flex items-center gap-3 py-2.5 px-4 text-left border-b border-[#ACACAC] bg-[#F5F5F5] focus:outline-none sm:text-sm">
                  <span className="block truncate">
                    {fromVersionObj?.label || 'Select version'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <img src={chevronDown} alt="" className="w-5 h-5" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {versions.map((version) => (
                      <Listbox.Option
                        key={version.id}
                        value={version.id}
                        disabled={version.id === toVersion}
                        className={({ active, disabled }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-10 ${
                            disabled ? 'text-gray-400 bg-gray-50' : ''
                          } ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {version.label}
                            </span>
                            {version.timestamp && (
                              <span className="block text-xs text-gray-500">
                                {formatDate(version.timestamp)}
                              </span>
                            )}
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                            <span
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                              onMouseEnter={showTooltip}
                              onMouseLeave={hideTooltip}
                            >
                              <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Swap versions"
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500" />
          </button>

          {/* To version */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Target:</span>
            <Listbox value={toVersion} onChange={onToChange}>
              <div className="relative">
                <Listbox.Button className="relative w-48 cursor-pointer flex items-center gap-3 py-2.5 px-4 text-left border-b border-[#ACACAC] bg-[#F5F5F5] focus:outline-none sm:text-sm">
                  <span className="block truncate">
                    {toVersionObj?.label || 'Select version'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <img src={chevronDown} alt="" className="w-5 h-5" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {versions.map((version) => (
                      <Listbox.Option
                        key={version.id}
                        value={version.id}
                        disabled={version.id === fromVersion}
                        className={({ active, disabled }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-10 ${
                            disabled ? 'text-gray-400 bg-gray-50' : ''
                          } ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {version.label}
                            </span>
                            {version.timestamp && (
                              <span className="block text-xs text-gray-500">
                                {formatDate(version.timestamp)}
                              </span>
                            )}
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                            <span
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                              onMouseEnter={showTooltip}
                              onMouseLeave={hideTooltip}
                            >
                              <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>
      {tooltipPos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)' }}
            className="pointer-events-none fixed z-[100] whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
          >
            Automatically created before restoring version "before change"
          </div>,
          document.body
        )}
    </div>
  );
}
