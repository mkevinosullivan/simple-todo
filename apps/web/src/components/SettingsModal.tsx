import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import type { WipConfig } from '../services/config.js';
import { getWipConfig, updateWipLimit } from '../services/config.js';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLimitUpdated?: () => void;
}

/**
 * SettingsModal - Settings dialog for configuring WIP limit
 *
 * Features:
 * - Accessible modal using Headless UI Dialog
 * - WIP limit slider (5-10 range)
 * - Shows current active task count
 * - Save/Cancel actions with dirty state tracking
 * - Success/error toast notifications
 * - Keyboard accessible (Tab, Enter, Escape)
 *
 * @example
 * <SettingsModal
 *   isOpen={isSettingsOpen}
 *   onClose={() => setIsSettingsOpen(false)}
 * />
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLimitUpdated,
}) => {
  const [wipConfig, setWipConfig] = useState<WipConfig | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(7);
  const [initialValue, setInitialValue] = useState<number>(7);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load WIP config when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWipConfig();
    }
  }, [isOpen]);

  /**
   * Loads current WIP configuration from API
   */
  const loadWipConfig = async (): Promise<void> => {
    try {
      const config = await getWipConfig();
      setWipConfig(config);
      setSliderValue(config.limit);
      setInitialValue(config.limit);
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to load WIP config:', error);
      setErrorMessage('Failed to load settings');
    }
  };

  /**
   * Handles slider value change
   */
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSliderValue(Number(event.target.value));
  };

  /**
   * Checks if form has unsaved changes
   */
  const isDirty = sliderValue !== initialValue;

  /**
   * Handles save button click
   */
  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await updateWipLimit(sliderValue);
      setWipConfig(updated);
      setInitialValue(sliderValue);
      setShowSuccessToast(true);

      // Notify parent to refresh WIP status
      if (onLimitUpdated) {
        onLimitUpdated();
      }

      // Auto-hide success toast after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to update WIP limit:', error);
      setErrorMessage('Please choose a limit between 5 and 10');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles cancel button click
   */
  const handleCancel = (): void => {
    // Reset to initial value
    setSliderValue(initialValue);
    setErrorMessage(null);
    setShowSuccessToast(false);
    onClose();
  };

  /**
   * Handles modal close (Escape key or backdrop click)
   */
  const handleClose = (): void => {
    handleCancel();
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          {/* Backdrop with fade animation */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </Transition.Child>

          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="mx-auto w-full max-w-[600px] rounded-xl bg-white p-4 shadow-xl">
                {/* Header with title and close button */}
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    Settings
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Close settings"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* WIP Limit Configuration Section */}
                <div className="mb-6">
                  <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                    WIP Limit Configuration
                  </h3>

                  {/* Current active task count */}
                  {wipConfig && (
                    <p className="mb-4 text-sm text-gray-600">
                      You currently have{' '}
                      <span className="font-semibold">{wipConfig.currentCount}</span> active tasks
                    </p>
                  )}

                  {/* Slider label */}
                  <label htmlFor="wip-limit-slider" className="mb-2 block text-base font-medium text-gray-700">
                    Work In Progress Limit (5-10 tasks)
                  </label>

                  {/* Slider value display */}
                  <div className="mb-3 text-center">
                    <span className="text-2xl font-bold text-blue-600">{sliderValue}</span>
                  </div>

                  {/* Slider control */}
                  <div className="mb-2 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">5</span>
                    <input
                      id="wip-limit-slider"
                      type="range"
                      min="5"
                      max="10"
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className="slider-track h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Work In Progress Limit"
                      aria-valuenow={sliderValue}
                      aria-valuemin={5}
                      aria-valuemax={10}
                    />
                    <span className="text-sm font-medium text-gray-600">10</span>
                  </div>

                  {/* Explanation text */}
                  <p className="text-sm text-gray-600">
                    Limits how many active tasks you can have at once. This helps prevent overwhelm.
                  </p>

                  {/* Error message */}
                  {errorMessage && (
                    <div className="mt-4 rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-gray-300 bg-transparent px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Success Toast */}
      {showSuccessToast && (
        <div
          className="fixed right-4 top-4 z-[60] animate-slide-in rounded-lg border border-green-400 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-lg"
          role="alert"
          aria-live="polite"
        >
          Settings saved!
        </div>
      )}
    </>
  );
};
