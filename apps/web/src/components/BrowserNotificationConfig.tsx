import type React from 'react';
import { useEffect, useState } from 'react';

import styles from './BrowserNotificationConfig.module.css';

interface BrowserNotificationConfigProps {
  enabled: boolean;
  onUpdate: (enabled: boolean) => void;
}

/**
 * BrowserNotificationConfig displays browser notification preferences settings
 *
 * Features:
 * - Toggle to enable/disable browser notifications
 * - Requests browser notification permission when toggled on
 * - Shows permission status messages
 * - Disabled toggle when permission not granted
 * - Keyboard accessible (Tab, Space, Enter)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <BrowserNotificationConfig
 *   enabled={true}
 *   onUpdate={(enabled) => updateConfig(enabled)}
 * />
 */
export const BrowserNotificationConfig: React.FC<BrowserNotificationConfigProps> = ({
  enabled,
  onUpdate,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  /**
   * Check notification permission on mount
   */
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  /**
   * Handles toggle change - requests permission if not granted
   */
  const handleToggleChange = async (newEnabled: boolean): Promise<void> => {
    // If trying to enable but permission not granted, request permission first
    if (newEnabled && permissionStatus !== 'granted') {
      setIsRequestingPermission(true);

      try {
        // Request permission using browser API
        let permission: NotificationPermission;

        // Handle both Promise-based and callback-based API
        if (typeof Notification.requestPermission === 'function') {
          const result = Notification.requestPermission();

          // Check if result is a Promise (modern browsers)
          if (result instanceof Promise) {
            permission = await result;
          } else {
            // Fallback for older browsers using callback pattern
            permission = await new Promise<NotificationPermission>((resolve) => {
              Notification.requestPermission(resolve);
            });
          }
        } else {
          // Extremely old browser - shouldn't happen but handle gracefully
          console.warn('Notification API not supported');
          setIsRequestingPermission(false);
          return;
        }

        setPermissionStatus(permission);
        setIsRequestingPermission(false);

        // Only enable if permission was granted
        if (permission === 'granted') {
          onUpdate(true);
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        setIsRequestingPermission(false);
      }
    } else {
      // If disabling or permission already granted, just update
      onUpdate(newEnabled);
    }
  };

  /**
   * Gets the permission status message to display
   */
  const getPermissionMessage = (): string | null => {
    if (!('Notification' in window)) {
      return 'Browser notifications are not supported in your browser';
    }

    if (permissionStatus === 'denied') {
      return 'Permission denied. Enable in browser settings to use this feature.';
    }

    if (permissionStatus === 'default') {
      return 'Click toggle to request notification permission';
    }

    if (permissionStatus === 'granted' && enabled) {
      return 'Browser notifications are enabled';
    }

    if (permissionStatus === 'granted' && !enabled) {
      return 'Browser notifications are disabled';
    }

    return null;
  };

  /**
   * Determines if toggle should be disabled
   */
  const isToggleDisabled = (): boolean => {
    // Disable if requesting permission
    if (isRequestingPermission) {
      return true;
    }

    // Disable if permission denied
    if (permissionStatus === 'denied') {
      return true;
    }

    // Disable if browser doesn't support notifications
    if (!('Notification' in window)) {
      return true;
    }

    return false;
  };

  const permissionMessage = getPermissionMessage();
  const toggleDisabled = isToggleDisabled();
  const isError = permissionStatus === 'denied' || !('Notification' in window);

  return (
    <section className={styles.browserNotificationConfig} aria-labelledby="browser-notification-heading">
      <h2 id="browser-notification-heading" className={styles.heading}>
        Browser Notifications
      </h2>

      <div className={styles.control}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            role="switch"
            aria-checked={enabled && !toggleDisabled}
            checked={enabled && !toggleDisabled}
            onChange={(e) => void handleToggleChange(e.target.checked)}
            disabled={toggleDisabled}
            className={styles.toggle}
            aria-disabled={toggleDisabled}
          />
          <span className={styles.toggleText}>Enable browser notifications</span>
        </label>
      </div>

      {permissionMessage && (
        <p className={isError ? styles.errorMessage : styles.statusMessage}>
          {permissionMessage}
        </p>
      )}

      <p className={styles.description}>
        Receive proactive prompts as browser notifications even when the app is in a background tab.
      </p>
    </section>
  );
};
