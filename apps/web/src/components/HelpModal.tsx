import type React from 'react';
import { Fragment, useEffect, useState, useRef } from 'react';

import { Dialog, Transition, Tab } from '@headlessui/react';
import ReactMarkdown from 'react-markdown';

import { useConfig } from '../context/ConfigContext.js';
import { QuickStartGuide } from './QuickStartGuide.js';
import styles from './HelpModal.module.css';

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  filename: string;
}

const HELP_SECTIONS: HelpSection[] = [
  { id: 'getting-started', title: 'Getting Started', filename: 'getting-started.md' },
  { id: 'wip-limits', title: 'WIP Limits', filename: 'wip-limits.md' },
  { id: 'proactive-prompts', title: 'Proactive Prompts', filename: 'proactive-prompts.md' },
  { id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts', filename: 'keyboard-shortcuts.md' },
  { id: 'troubleshooting', title: 'Troubleshooting', filename: 'troubleshooting.md' },
];

/**
 * HelpModal - Help documentation modal with tabbed sections
 *
 * Features:
 * - Accessible modal using Headless UI Dialog
 * - Tabbed navigation for 5 help sections
 * - Dynamic markdown content loading
 * - Quick Start Guide integration
 * - Keyboard accessible (Tab, Enter, Escape)
 * - Focus trap and focus restoration
 *
 * @example
 * <HelpModal
 *   isOpen={isHelpOpen}
 *   onClose={() => setIsHelpOpen(false)}
 * />
 */
export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { config } = useConfig();
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Load markdown content when section changes
  useEffect(() => {
    if (isOpen && !showQuickStart) {
      const section = HELP_SECTIONS[selectedIndex];
      if (section) {
        void loadMarkdownContent(section.filename);
      }
    }
  }, [isOpen, selectedIndex, showQuickStart]);

  /**
   * Loads markdown content file dynamically
   */
  const loadMarkdownContent = async (filename: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Dynamic import of markdown file as raw text using Vite's import syntax
      const modules = import.meta.glob('../content/help/*.md', { as: 'raw', eager: false });
      const importPath = `../content/help/${filename}`;

      if (importPath in modules) {
        const content = await modules[importPath]() as string;
        setMarkdownContent(content);
      } else {
        throw new Error(`Markdown file not found: ${filename}`);
      }
    } catch (err) {
      console.error(`Failed to load help content: ${filename}`, err);
      setError('Content not available. Please try again later.');
      setMarkdownContent('');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles modal close
   */
  const handleClose = (): void => {
    setShowQuickStart(false);
    setSelectedIndex(0);
    setError(null);
    onClose();

    // Restore focus to previously focused element
    setTimeout(() => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }, 0);
  };

  /**
   * Handles Quick Start Guide button click
   */
  const handleShowQuickStart = (): void => {
    setShowQuickStart(true);
  };

  /**
   * Handles Quick Start Guide dismiss
   */
  const handleDismissQuickStart = (): void => {
    setShowQuickStart(false);
  };

  // If Quick Start is shown, render it instead of help content
  if (showQuickStart) {
    return (
      <QuickStartGuide
        wipLimit={config?.wipLimit ?? 7}
        onDismiss={handleDismissQuickStart}
      />
    );
  }

  return (
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
                <Dialog.Title as="h2" id="help-title" className={styles.title}>
                  Help & Documentation
                </Dialog.Title>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.closeButton}
                  aria-label="Close help modal"
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

              {/* Tabbed content sections */}
              <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className={styles.tabList} role="navigation" aria-label="Help sections">
                  {HELP_SECTIONS.map((section) => (
                    <Tab key={section.id} className={styles.tab}>
                      {({ selected }) => (
                        <span className={selected ? styles.tabSelected : styles.tabDefault}>
                          {section.title}
                        </span>
                      )}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className={styles.tabPanels}>
                  {HELP_SECTIONS.map((section) => (
                    <Tab.Panel key={section.id} className={styles.tabPanel} role="region">
                      {/* Loading state */}
                      {isLoading && (
                        <div className={styles.loading} role="status" aria-live="polite">
                          Loading...
                        </div>
                      )}

                      {/* Error state */}
                      {error && (
                        <div className={styles.error} role="alert">
                          {error}
                        </div>
                      )}

                      {/* Markdown content */}
                      {!isLoading && !error && (
                        <div className={styles.markdownContent}>
                          <ReactMarkdown>{markdownContent}</ReactMarkdown>
                        </div>
                      )}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>

              {/* Quick Start Guide link */}
              <div className={styles.quickStartSection}>
                <button
                  type="button"
                  onClick={handleShowQuickStart}
                  className={styles.quickStartButton}
                  aria-label="Show interactive getting started guide"
                >
                  📚 Show Getting Started Guide
                </button>
              </div>

              {/* Still need help section */}
              <div className={styles.supportSection}>
                <p className={styles.supportText}>
                  <strong>Still need help?</strong>
                </p>
                <p className={styles.supportText}>
                  Contact us at{' '}
                  <a
                    href="mailto:support@simpletodo.app"
                    className={styles.supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    support@simpletodo.app
                  </a>{' '}
                  - we're here to help!
                </p>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
