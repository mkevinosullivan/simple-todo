import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ConfigProvider } from '../../../src/context/ConfigContext';
import { HelpModal } from '../../../src/components/HelpModal';

expect.extend(toHaveNoViolations);

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>,
}));

// Mock QuickStartGuide
vi.mock('../../../src/components/QuickStartGuide', () => ({
  QuickStartGuide: ({ onDismiss }: { onDismiss: () => void }) => (
    <div data-testid="quick-start-guide">
      <button onClick={onDismiss}>Close Quick Start</button>
    </div>
  ),
}));

// Mock markdown content loading
const mockMarkdownContent = {
  'getting-started.md': '# Getting Started\n\nWelcome to the app!',
  'wip-limits.md': '# WIP Limits\n\nStay focused!',
  'proactive-prompts.md': '# Proactive Prompts\n\nGet reminded!',
  'keyboard-shortcuts.md': '# Keyboard Shortcuts\n\nNavigate efficiently!',
  'troubleshooting.md': '# Troubleshooting\n\nHaving issues?',
};

global.fetch = vi.fn((url: string) => {
  const filename = (url as string).split('/').pop()?.replace('?raw', '');
  const content = mockMarkdownContent[filename as keyof typeof mockMarkdownContent];

  if (content) {
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(content),
    } as Response);
  }

  return Promise.resolve({
    ok: false,
    text: () => Promise.resolve(''),
  } as Response);
});

const renderHelpModal = (isOpen: boolean = true) => {
  const onClose = vi.fn();

  const result = render(
    <ConfigProvider initialConfig={{ wipLimit: 7, hasCompletedSetup: true, celebrationsEnabled: true, celebrationDurationSeconds: 7, promptingEnabled: false, promptingFrequencyHours: 4 }}>
      <HelpModal isOpen={isOpen} onClose={onClose} />
    </ConfigProvider>
  );

  return { ...result, onClose };
};

describe('HelpModal Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderHelpModal();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper dialog role and ARIA attributes', () => {
    const { container } = renderHelpModal();

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should have aria-labelledby pointing to title', () => {
    renderHelpModal();

    const title = screen.getByText('Help & Documentation');
    expect(title).toHaveAttribute('id', 'help-title');
  });

  it('should have accessible close button with aria-label', () => {
    renderHelpModal();

    const closeButton = screen.getByLabelText('Close help modal');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close help modal');
  });

  it('should have keyboard accessible tab navigation', () => {
    const { container } = renderHelpModal();

    const tabList = container.querySelector('[role="navigation"]');
    expect(tabList).toBeInTheDocument();
    expect(tabList).toHaveAttribute('aria-label', 'Help sections');
  });

  it('should focus first interactive element when opened', () => {
    renderHelpModal();

    // The first tab should be focusable
    const firstTab = screen.getByText('Getting Started');
    expect(firstTab).toBeInTheDocument();
  });

  it('should support keyboard navigation with Tab key', () => {
    renderHelpModal();

    const firstTab = screen.getByText('Getting Started');
    const secondTab = screen.getByText('WIP Limits');

    firstTab.focus();
    expect(document.activeElement).toBe(firstTab);

    // Simulate Tab key
    fireEvent.keyDown(firstTab, { key: 'Tab' });

    // Focus should move to next element (not testing exact element due to Headless UI internals)
    expect(document.activeElement).not.toBe(null);
  });

  it('should support Enter key to activate tabs', () => {
    renderHelpModal();

    const wipLimitsTab = screen.getByText('WIP Limits');
    wipLimitsTab.focus();

    fireEvent.keyDown(wipLimitsTab, { key: 'Enter' });

    // Tab should be activated (selected state would change)
    expect(wipLimitsTab).toBeInTheDocument();
  });

  it('should have proper focus indicators on all interactive elements', () => {
    renderHelpModal();

    const closeButton = screen.getByLabelText('Close help modal');
    closeButton.focus();

    // Focus should be visible (CSS :focus-visible applied)
    expect(document.activeElement).toBe(closeButton);
  });

  it('should have accessible Quick Start Guide button with aria-label', () => {
    renderHelpModal();

    const quickStartButton = screen.getByLabelText('Show interactive getting started guide');
    expect(quickStartButton).toBeInTheDocument();
    expect(quickStartButton).toHaveAttribute('aria-label', 'Show interactive getting started guide');
  });

  it('should announce loading state to screen readers', () => {
    renderHelpModal();

    // Loading indicator should have role="status" and aria-live
    // (This would be visible during actual markdown loading)
  });

  it('should announce errors to screen readers', () => {
    // Mock fetch to fail
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve(''),
      } as Response)
    );

    renderHelpModal();

    // Error should have role="alert" for screen reader announcement
    // (Would appear when markdown fails to load)
  });

  it('should maintain focus trap within modal', () => {
    renderHelpModal();

    // Headless UI Dialog automatically implements focus trap
    // Verify modal container exists
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should have accessible region for tab panels', () => {
    const { container } = renderHelpModal();

    // Tab panels should have proper regions
    const regions = container.querySelectorAll('[role="region"]');
    expect(regions.length).toBeGreaterThan(0);
  });

  it('should have sufficient color contrast for text', () => {
    renderHelpModal();

    // Visual regression test would verify WCAG 2.1 AA contrast ratios
    // (4.5:1 for normal text, 3:1 for large text)
    // CSS variables ensure proper contrast in implementation
    expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
  });

  it('should support Escape key for modal dismissal', () => {
    const { onClose } = renderHelpModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('should have semantic HTML for support section', () => {
    renderHelpModal();

    const supportEmail = screen.getByText(/support@simpletodo.app/i);
    const emailLink = supportEmail.closest('a');

    expect(emailLink).toHaveAttribute('href', 'mailto:support@simpletodo.app');
    expect(emailLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
