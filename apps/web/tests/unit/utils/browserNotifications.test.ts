import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  canSendBrowserNotification,
  sendBrowserNotification,
} from '../../../src/utils/browserNotifications.js';

describe('browserNotifications', () => {
  let mockNotification: typeof Notification;
  let mockNotificationInstance: Notification;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let windowFocusSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Spy on console methods
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Spy on window.focus
    windowFocusSpy = vi.spyOn(window, 'focus').mockImplementation(() => {});

    // Mock Notification instance
    mockNotificationInstance = {
      close: vi.fn(),
      onclick: null,
    } as unknown as Notification;

    // Mock Notification constructor
    const NotificationConstructor = vi.fn(() => mockNotificationInstance);
    NotificationConstructor.permission = 'granted';

    mockNotification = NotificationConstructor as unknown as typeof Notification;

    // Assign to global window
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: mockNotification,
    });
  });

  describe('sendBrowserNotification', () => {
    it('should create notification with correct title and body', () => {
      const NotificationSpy = vi.fn(() => mockNotificationInstance);
      NotificationSpy.permission = 'granted';
      window.Notification = NotificationSpy as unknown as typeof Notification;

      sendBrowserNotification('Buy groceries', 'task-123');

      expect(NotificationSpy).toHaveBeenCalledWith('Simple To-Do App', {
        body: 'Could you do Buy groceries now?',
        icon: '/favicon.ico',
        tag: 'proactive-prompt-task-123',
        requireInteraction: false,
      });
    });

    it('should not create notification if permission not granted', () => {
      const NotificationSpy = vi.fn(() => mockNotificationInstance);
      NotificationSpy.permission = 'denied';
      window.Notification = NotificationSpy as unknown as typeof Notification;

      sendBrowserNotification('Buy groceries', 'task-123');

      expect(NotificationSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Notification permission not granted');
    });

    it('should not create notification if Notification API not supported', () => {
      // Remove Notification from window
      Object.defineProperty(window, 'Notification', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      sendBrowserNotification('Buy groceries', 'task-123');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Browser notifications not supported');
    });

    it('should attach click handler that focuses window', () => {
      const NotificationSpy = vi.fn(() => mockNotificationInstance);
      NotificationSpy.permission = 'granted';
      window.Notification = NotificationSpy as unknown as typeof Notification;

      sendBrowserNotification('Buy groceries', 'task-123');

      // Notification should have been created
      expect(NotificationSpy).toHaveBeenCalled();

      // Simulate click on notification
      if (mockNotificationInstance.onclick) {
        mockNotificationInstance.onclick(new Event('click'));
      }

      expect(windowFocusSpy).toHaveBeenCalled();
      expect(mockNotificationInstance.close).toHaveBeenCalled();
    });

    it('should use task ID in notification tag to prevent duplicates', () => {
      const NotificationSpy = vi.fn(() => mockNotificationInstance);
      NotificationSpy.permission = 'granted';
      window.Notification = NotificationSpy as unknown as typeof Notification;

      sendBrowserNotification('Buy groceries', 'unique-task-id-456');

      expect(NotificationSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tag: 'proactive-prompt-unique-task-id-456',
        })
      );
    });

    it('should handle notification creation error gracefully', () => {
      const NotificationSpy = vi.fn(() => {
        throw new Error('Notification creation failed');
      });
      NotificationSpy.permission = 'granted';
      window.Notification = NotificationSpy as unknown as typeof Notification;

      // Should not throw
      expect(() => {
        sendBrowserNotification('Buy groceries', 'task-123');
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create browser notification:',
        expect.any(Error)
      );
    });
  });

  describe('canSendBrowserNotification', () => {
    it('should return true when enabled and permission granted', () => {
      mockNotification.permission = 'granted';

      const result = canSendBrowserNotification(true);

      expect(result).toBe(true);
    });

    it('should return false when disabled in config', () => {
      mockNotification.permission = 'granted';

      const result = canSendBrowserNotification(false);

      expect(result).toBe(false);
    });

    it('should return false when permission not granted', () => {
      mockNotification.permission = 'denied';

      const result = canSendBrowserNotification(true);

      expect(result).toBe(false);
    });

    it('should return false when permission is default', () => {
      mockNotification.permission = 'default';

      const result = canSendBrowserNotification(true);

      expect(result).toBe(false);
    });

    it('should return false when Notification API not supported', () => {
      // Remove Notification from window
      Object.defineProperty(window, 'Notification', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const result = canSendBrowserNotification(true);

      expect(result).toBe(false);
    });

    it('should return false when all conditions fail', () => {
      // Remove Notification from window
      Object.defineProperty(window, 'Notification', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const result = canSendBrowserNotification(false);

      expect(result).toBe(false);
    });
  });
});
