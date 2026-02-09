import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserNotificationConfig } from '../../../src/components/BrowserNotificationConfig.js';

describe('BrowserNotificationConfig', () => {
  let mockNotification: typeof Notification;
  let mockRequestPermission: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock Notification API
    mockRequestPermission = vi.fn();
    mockNotification = {
      permission: 'default',
      requestPermission: mockRequestPermission,
    } as unknown as typeof Notification;

    // Assign to global window
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: mockNotification,
    });
  });

  describe('Initial Render', () => {
    it('should render heading and toggle', () => {
      const mockOnUpdate = vi.fn();

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      expect(screen.getByRole('heading', { name: /browser notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /enable browser notifications/i })).toBeInTheDocument();
    });

    it('should render description text', () => {
      const mockOnUpdate = vi.fn();

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      expect(
        screen.getByText(/receive proactive prompts as browser notifications/i)
      ).toBeInTheDocument();
    });
  });

  describe('Permission States', () => {
    it('should show permission request message when permission is default', () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'default';

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      expect(screen.getByText(/click toggle to request notification permission/i)).toBeInTheDocument();
    });

    it('should show error message when permission is denied', () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'denied';

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      expect(
        screen.getByText(/permission denied.*enable in browser settings/i)
      ).toBeInTheDocument();
    });

    it('should show enabled message when permission granted and enabled', () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'granted';

      render(<BrowserNotificationConfig enabled={true} onUpdate={mockOnUpdate} />);

      expect(screen.getByText(/browser notifications are enabled/i)).toBeInTheDocument();
    });

    it('should show disabled message when permission granted but disabled', () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'granted';

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      expect(screen.getByText(/browser notifications are disabled/i)).toBeInTheDocument();
    });
  });

  describe('Toggle Behavior', () => {
    it('should have toggle disabled when permission is denied', () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'denied';

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });

    it('should request permission when toggle clicked with default permission', async () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'default';
      mockRequestPermission.mockResolvedValue('granted');

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('should call onUpdate with true when permission granted', async () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'default';
      mockRequestPermission.mockResolvedValue('granted');

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(true);
      });
    });

    it('should not call onUpdate when permission denied after request', async () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'default';
      mockRequestPermission.mockResolvedValue('denied');

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should call onUpdate when toggling off with granted permission', () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'granted';

      render(<BrowserNotificationConfig enabled={true} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(mockOnUpdate).toHaveBeenCalledWith(false);
    });
  });

  describe('Browser Support', () => {
    it('should show unsupported message when Notification API not available', () => {
      const mockOnUpdate = vi.fn();

      // Remove Notification from window
      Object.defineProperty(window, 'Notification', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      expect(
        screen.getByText(/browser notifications are not supported/i)
      ).toBeInTheDocument();
    });

    it('should have toggle disabled when Notification API not available', () => {
      const mockOnUpdate = vi.fn();

      // Remove Notification from window
      Object.defineProperty(window, 'Notification', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });
  });

  describe('Callback-based Permission API', () => {
    it('should handle callback-based requestPermission API', async () => {
      const mockOnUpdate = vi.fn();
      mockNotification.permission = 'default';

      // Mock callback-based API (returns void, uses callback)
      const callbackRequestPermission = vi.fn((callback: (permission: NotificationPermission) => void) => {
        callback('granted');
      });

      mockNotification.requestPermission = callbackRequestPermission as never;

      render(<BrowserNotificationConfig enabled={false} onUpdate={mockOnUpdate} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(true);
      });
    });
  });
});
