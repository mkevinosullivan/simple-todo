import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import type { WipConfig } from '../services/config.js';
import { getWipConfig, updateWipLimit } from '../services/config.js';
import styles from './SettingsModal.module.css';

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
        <Dialog as="div" className={styles.modalWrapper} onClose={handleClose}>
          {/* Backdrop with fade animation */}
          <Transition.Child
            as={Fragment}
            enter={styles.backdropEnter}
            enterFrom={styles.backdropEnter}
            enterTo={styles.backdropEnterActive}
            leave={styles.backdropExit}
            leaveFrom={styles.backdropExit}
            leaveTo={styles.backdropExitActive}
          >
            <div className={styles.backdrop} aria-hidden="true" />
          </Transition.Child>

          {/* Full-screen container to center the panel */}
          <div className={styles.modalContainer}>
            <Transition.Child
              as={Fragment}
              enter={styles.panelEnter}
              enterFrom={styles.panelEnter}
              enterTo={styles.panelEnterActive}
              leave={styles.panelExit}
              leaveFrom={styles.panelExit}
              leaveTo={styles.panelExitActive}
            >
              <Dialog.Panel className={styles.modalPanel}>
                {/* Header with title and close button */}
                <div className={styles.header}>
                  <Dialog.Title as="h2" className={styles.title}>
                    Settings
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className={styles.closeButton}
                    aria-label="Close settings"
                  >
                    <svg
                      className={styles.closeIcon}
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
                <div className={styles.wipSection}>
                  <h3 className={styles.sectionTitle}>WIP Limit Configuration</h3>

                  {/* Current active task count */}
                  {wipConfig && (
                    <p className={styles.currentCount}>
                      You currently have <strong>{wipConfig.currentCount}</strong> active tasks
                    </p>
                  )}

                  {/* Slider label */}
                  <label htmlFor="wip-limit-slider" className={styles.sliderLabel}>
                    Work In Progress Limit (5-10 tasks)
                  </label>

                  {/* Slider value display */}
                  <div className={styles.sliderValueDisplay}>
                    <span className={styles.sliderValue}>{sliderValue}</span>
                  </div>

                  {/* Slider control */}
                  <div className={styles.sliderContainer}>
                    <span className={styles.sliderMinMax}>5</span>
                    <input
                      id="wip-limit-slider"
                      type="range"
                      min="5"
                      max="10"
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className={styles.slider}
                      aria-label="Work In Progress Limit"
                      aria-valuenow={sliderValue}
                      aria-valuemin={5}
                      aria-valuemax={10}
                    />
                    <span className={styles.sliderMinMax}>10</span>
                  </div>

                  {/* Explanation text */}
                  <p className={styles.helpText}>
                    Limits how many active tasks you can have at once. This helps prevent overwhelm.
                  </p>

                  {/* Error message */}
                  {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
                </div>

                {/* Footer buttons */}
                <div className={styles.footer}>
                  <button type="button" onClick={handleCancel} className={styles.btnCancel}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className={styles.btnSave}
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
        <div className={styles.successToast} role="alert" aria-live="polite">
          Settings saved!
        </div>
      )}
    </>
  );
};
