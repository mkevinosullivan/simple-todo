import type React from 'react';
import { Fragment, useEffect, useState } from 'react';

import { Dialog, Transition } from '@headlessui/react';
import type { PromptAnalytics } from '@simple-todo/shared/types';

import { useConfig } from '../context/ConfigContext.js';
import { useCelebrationQueue } from '../hooks/useCelebrationQueue.js';
import { getPromptAnalytics } from '../services/analytics.js';
import type {
  CelebrationConfig as CelebrationConfigType,
  PromptingConfig as PromptingConfigType,
  WipConfig,
} from '../services/config.js';
import {
  getCelebrationConfig,
  getPromptingConfig,
  getWipConfig,
  updateBrowserNotifications,
  updateCelebrationConfig,
  updatePromptingConfig,
  updateWipLimit,
} from '../services/config.js';

import { BrowserNotificationConfig } from './BrowserNotificationConfig.js';
import { CelebrationConfig } from './CelebrationConfig.js';
import { CelebrationOverlay } from './CelebrationOverlay.js';
import { PromptingConfig } from './PromptingConfig.js';
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
  const { config: globalConfig, updateConfig: updateGlobalConfig } = useConfig();
  const { currentCelebration, queueCelebration, dismissCelebration } = useCelebrationQueue();
  const [wipConfig, setWipConfig] = useState<WipConfig | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(7);
  const [initialValue, setInitialValue] = useState<number>(7);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [celebrationConfig, setCelebrationConfig] = useState<CelebrationConfigType>({
    celebrationsEnabled: true,
    celebrationDurationSeconds: 7,
  });
  const [initialCelebrationConfig, setInitialCelebrationConfig] = useState<CelebrationConfigType>({
    celebrationsEnabled: true,
    celebrationDurationSeconds: 7,
  });
  const [promptingConfig, setPromptingConfig] = useState<PromptingConfigType>({
    enabled: true,
    frequencyHours: 2.5,
  });
  const [initialPromptingConfig, setInitialPromptingConfig] = useState<PromptingConfigType>({
    enabled: true,
    frequencyHours: 2.5,
  });
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(false);
  const [initialBrowserNotificationsEnabled, setInitialBrowserNotificationsEnabled] =
    useState<boolean>(false);
  const [promptAnalytics, setPromptAnalytics] = useState<PromptAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  // Load configs when modal opens
  useEffect(() => {
    if (isOpen) {
      void loadConfigs();
      void loadPromptAnalytics();
    }
  }, [isOpen]);

  /**
   * Loads current configurations from API
   */
  const loadConfigs = async (): Promise<void> => {
    try {
      // Load WIP config
      const wipConfigData = await getWipConfig();
      setWipConfig(wipConfigData);
      setSliderValue(wipConfigData.limit);
      setInitialValue(wipConfigData.limit);

      // Load celebration config
      const celebrationConfigData = await getCelebrationConfig();
      setCelebrationConfig(celebrationConfigData);
      setInitialCelebrationConfig(celebrationConfigData);

      // Load prompting config
      const promptingConfigData = await getPromptingConfig();
      setPromptingConfig(promptingConfigData);
      setInitialPromptingConfig(promptingConfigData);

      // Load browser notifications config from global config
      const browserNotificationsEnabledValue = globalConfig?.browserNotificationsEnabled ?? false;
      setBrowserNotificationsEnabled(browserNotificationsEnabledValue);
      setInitialBrowserNotificationsEnabled(browserNotificationsEnabledValue);

      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to load configs:', error);
      setErrorMessage('Failed to load settings');
    }
  };

  /**
   * Loads prompt analytics from API
   */
  const loadPromptAnalytics = async (): Promise<void> => {
    setAnalyticsLoading(true);
    try {
      const analytics = await getPromptAnalytics();
      setPromptAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load prompt analytics:', error);
      // Non-critical error - don't show error message to user
      setPromptAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
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
  const isDirty =
    sliderValue !== initialValue ||
    celebrationConfig.celebrationsEnabled !== initialCelebrationConfig.celebrationsEnabled ||
    celebrationConfig.celebrationDurationSeconds !==
      initialCelebrationConfig.celebrationDurationSeconds ||
    promptingConfig.enabled !== initialPromptingConfig.enabled ||
    promptingConfig.frequencyHours !== initialPromptingConfig.frequencyHours ||
    browserNotificationsEnabled !== initialBrowserNotificationsEnabled;

  /**
   * Handles save button click
   */
  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Save WIP limit if changed
      if (sliderValue !== initialValue) {
        const updated = await updateWipLimit(sliderValue);
        setWipConfig(updated);
        setInitialValue(sliderValue);

        // Notify parent to refresh WIP status
        if (onLimitUpdated) {
          onLimitUpdated();
        }
      }

      // Save celebration config if changed
      if (
        celebrationConfig.celebrationsEnabled !== initialCelebrationConfig.celebrationsEnabled ||
        celebrationConfig.celebrationDurationSeconds !==
          initialCelebrationConfig.celebrationDurationSeconds
      ) {
        const updatedConfig = await updateCelebrationConfig(
          celebrationConfig.celebrationsEnabled,
          celebrationConfig.celebrationDurationSeconds
        );

        // Update global config context so changes take effect immediately (AC: 8)
        updateGlobalConfig(updatedConfig);
        setInitialCelebrationConfig({
          celebrationsEnabled: updatedConfig.celebrationsEnabled,
          celebrationDurationSeconds: updatedConfig.celebrationDurationSeconds,
        });
      }

      // Save prompting config if changed
      if (
        promptingConfig.enabled !== initialPromptingConfig.enabled ||
        promptingConfig.frequencyHours !== initialPromptingConfig.frequencyHours
      ) {
        const updatedPromptingConfig = await updatePromptingConfig(
          promptingConfig.enabled,
          promptingConfig.frequencyHours
        );

        setInitialPromptingConfig({
          enabled: updatedPromptingConfig.enabled,
          frequencyHours: updatedPromptingConfig.frequencyHours,
        });
      }

      // Save browser notifications config if changed
      if (browserNotificationsEnabled !== initialBrowserNotificationsEnabled) {
        const updatedConfig = await updateBrowserNotifications(browserNotificationsEnabled);

        // Update global config context so changes take effect immediately
        updateGlobalConfig(updatedConfig);
        setInitialBrowserNotificationsEnabled(updatedConfig.browserNotificationsEnabled);
      }

      setShowSuccessToast(true);

      // Auto-hide success toast after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles cancel button click
   */
  const handleCancel = (): void => {
    // Reset to initial values
    setSliderValue(initialValue);
    setCelebrationConfig(initialCelebrationConfig);
    setPromptingConfig(initialPromptingConfig);
    setBrowserNotificationsEnabled(initialBrowserNotificationsEnabled);
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

  /**
   * Handles celebration config update (local state only, saved on Save button click)
   */
  const handleUpdateCelebrationConfig = (enabled: boolean, duration: number): void => {
    setCelebrationConfig({
      celebrationsEnabled: enabled,
      celebrationDurationSeconds: duration,
    });
  };

  /**
   * Handles preview celebration button click
   */
  const handlePreviewCelebration = (): void => {
    queueCelebration({
      message: 'This is a preview celebration! 🎉',
      variant: 'enthusiastic',
      duration: celebrationConfig.celebrationDurationSeconds * 1000,
    });
  };

  /**
   * Handles prompting config update (local state only, saved on Save button click)
   */
  const handleUpdatePromptingConfig = (enabled: boolean, frequencyHours: number): void => {
    setPromptingConfig({
      enabled,
      frequencyHours,
    });
  };

  /**
   * Handles browser notifications config update (local state only, saved on Save button click)
   */
  const handleUpdateBrowserNotifications = (enabled: boolean): void => {
    setBrowserNotificationsEnabled(enabled);
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

                {/* Celebration Configuration Section */}
                <CelebrationConfig
                  celebrationsEnabled={celebrationConfig.celebrationsEnabled}
                  celebrationDurationSeconds={celebrationConfig.celebrationDurationSeconds}
                  onUpdate={handleUpdateCelebrationConfig}
                  onPreview={handlePreviewCelebration}
                />

                {/* Prompting Configuration Section */}
                <PromptingConfig
                  enabled={promptingConfig.enabled}
                  frequencyHours={promptingConfig.frequencyHours}
                  nextPromptTime={
                    promptingConfig.nextPromptTime ? new Date(promptingConfig.nextPromptTime) : null
                  }
                  onUpdate={handleUpdatePromptingConfig}
                />

                {/* Browser Notification Configuration Section */}
                <BrowserNotificationConfig
                  enabled={browserNotificationsEnabled}
                  onUpdate={handleUpdateBrowserNotifications}
                />

                {/* Prompt Analytics Section */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Prompt Analytics</h3>
                  <p className={styles.sectionDescription}>
                    Track your engagement with proactive task prompts.
                  </p>

                  {analyticsLoading ? (
                    <p className={styles.loadingText}>Loading analytics...</p>
                  ) : promptAnalytics ? (
                    <div className={styles.analyticsGrid}>
                      <div className={styles.analyticsStat}>
                        <span className={styles.statsLabel}>Response Rate</span>
                        <span className={styles.statsValue}>
                          {promptAnalytics.promptResponseRate.toFixed(1)}%
                        </span>
                        <span className={styles.statsHint}>
                          {promptAnalytics.promptResponseRate >= 40
                            ? '✓ Exceeds 40% target'
                            : 'Target: ≥40%'}
                        </span>
                      </div>

                      <div className={styles.analyticsStat}>
                        <span className={styles.statsLabel}>Completed</span>
                        <span className={styles.statsValue}>
                          {promptAnalytics.responseBreakdown.complete}
                        </span>
                      </div>

                      <div className={styles.analyticsStat}>
                        <span className={styles.statsLabel}>Dismissed</span>
                        <span className={styles.statsValue}>
                          {promptAnalytics.responseBreakdown.dismiss}
                        </span>
                      </div>

                      <div className={styles.analyticsStat}>
                        <span className={styles.statsLabel}>Snoozed</span>
                        <span className={styles.statsValue}>
                          {promptAnalytics.responseBreakdown.snooze}
                        </span>
                      </div>

                      <div className={styles.analyticsStat}>
                        <span className={styles.statsLabel}>Timed Out</span>
                        <span className={styles.statsValue}>
                          {promptAnalytics.responseBreakdown.timeout}
                        </span>
                      </div>

                      <div className={styles.analyticsStat}>
                        <span className={styles.statsLabel}>Avg Response Time</span>
                        <span className={styles.statsValue}>
                          {promptAnalytics.averageResponseTime > 0
                            ? `${(promptAnalytics.averageResponseTime / 1000).toFixed(1)}s`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noDataText}>No prompt data available yet.</p>
                  )}
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

      {/* Preview Celebration Overlay */}
      {currentCelebration && (
        <CelebrationOverlay
          message={currentCelebration.message}
          variant={currentCelebration.variant}
          duration={currentCelebration.duration}
          onDismiss={dismissCelebration}
        />
      )}
    </>
  );
};
