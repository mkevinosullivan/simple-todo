import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ConfigProvider } from '../../../src/context/ConfigContext';
import { HelpModal } from '../../../src/components/HelpModal';

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

// Mock global fetch for markdown content loading
const mockMarkdownContent = {
  'getting-started.md': '# Getting Started\n\nWelcome to the app!',
  'wip-limits.md': '# WIP Limits\n\nStay focused!',
  'proactive-prompts.md': '# Proactive Prompts\n\nGet reminded!',
  'keyboard-shortcuts.md': '# Keyboard Shortcuts\n\nNavigate efficiently!',
  'troubleshooting.md': '# Troubleshooting\n\nHaving issues?',
};

// Setup fetch mock
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

// Mock import.meta.glob
vi.mock('virtual:glob-import', () => ({
  '../content/help/*.md': {},
}));

const renderHelpModal = (isOpen: boolean = true) => {
  const onClose = vi.fn();

  const result = render(
    <ConfigProvider initialConfig={{ wipLimit: 7, hasCompletedSetup: true, celebrationsEnabled: true, celebrationDurationSeconds: 7, promptingEnabled: false, promptingFrequencyHours: 4 }}>
      <HelpModal isOpen={isOpen} onClose={onClose} />
    </ConfigProvider>
  );

  return { ...result, onClose };
};

describe('HelpModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render help modal when open', () => {
    renderHelpModal(true);

    expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    renderHelpModal(false);

    expect(screen.queryByText('Help & Documentation')).not.toBeInTheDocument();
  });

  it('should render all 5 help section tabs', () => {
    renderHelpModal();

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('WIP Limits')).toBeInTheDocument();
    expect(screen.getByText('Proactive Prompts')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
  });

  it('should close modal when close button clicked', () => {
    const { onClose } = renderHelpModal();

    const closeButton = screen.getByLabelText('Close help modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when Escape key pressed', async () => {
    const { onClose } = renderHelpModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should render "Show Getting Started Guide" button', () => {
    renderHelpModal();

    expect(screen.getByText(/Show Getting Started Guide/i)).toBeInTheDocument();
  });

  it('should show Quick Start Guide when button clicked', async () => {
    renderHelpModal();

    const quickStartButton = screen.getByText(/Show Getting Started Guide/i);
    fireEvent.click(quickStartButton);

    await waitFor(() => {
      expect(screen.getByTestId('quick-start-guide')).toBeInTheDocument();
    });
  });

  it('should close Quick Start Guide and return to help content', async () => {
    renderHelpModal();

    // Open Quick Start Guide
    const quickStartButton = screen.getByText(/Show Getting Started Guide/i);
    fireEvent.click(quickStartButton);

    await waitFor(() => {
      expect(screen.getByTestId('quick-start-guide')).toBeInTheDocument();
    });

    // Close Quick Start Guide
    const closeButton = screen.getByText('Close Quick Start');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('quick-start-guide')).not.toBeInTheDocument();
      expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    });
  });

  it('should render "Still need help?" section with support email', () => {
    renderHelpModal();

    expect(screen.getByText(/Still need help\?/i)).toBeInTheDocument();
    expect(screen.getByText(/support@simpletodo.app/i)).toBeInTheDocument();
  });

  it('should have support email as clickable link', () => {
    renderHelpModal();

    const emailLink = screen.getByText(/support@simpletodo.app/i);
    expect(emailLink).toHaveAttribute('href', 'mailto:support@simpletodo.app');
  });

  it('should have proper ARIA attributes', () => {
    const { container } = renderHelpModal();

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should have accessible tab navigation', () => {
    const { container } = renderHelpModal();

    const tabList = container.querySelector('[role="navigation"]');
    expect(tabList).toBeInTheDocument();
    expect(tabList).toHaveAttribute('aria-label', 'Help sections');
  });

  it('should switch sections when tab clicked', async () => {
    renderHelpModal();

    // Click on WIP Limits tab
    const wipLimitsTab = screen.getByText('WIP Limits');
    fireEvent.click(wipLimitsTab);

    await waitFor(() => {
      // The markdown content should be rendered
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });
  });
});
