/**
 * Browser notification utility functions for proactive prompts
 *
 * Handles creation and display of browser notifications when:
 * - Browser notifications are enabled in config
 * - Notification permission is granted
 * - Browser supports Notification API
 */

/**
 * Sends a browser notification for a proactive prompt
 *
 * @param taskText - The text of the task being prompted
 * @param taskId - The ID of the task (used for notification tag to prevent duplicates)
 *
 * @example
 * sendBrowserNotification('Buy groceries', 'task-123');
 */
export function sendBrowserNotification(taskText: string, taskId: string): void {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return;
  }

  // Check if permission is granted
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Create notification with standard options
    const notification = new Notification('Simple To-Do App', {
      body: `Could you do ${taskText} now?`,
      icon: '/favicon.ico', // TODO: Update to actual icon path (e.g., /logo-192x192.png) when available
      tag: `proactive-prompt-${taskId}`, // Prevents duplicate notifications for same task
      requireInteraction: false, // Auto-dismisses (respects OS settings)
    });

    // Attach click handler to focus window when notification is clicked
    notification.onclick = (): void => {
      // Bring window to focus
      window.focus();

      // Close notification after click
      notification.close();
    };
  } catch (error) {
    console.error('Failed to create browser notification:', error);
  }
}

/**
 * Checks if browser notifications are available and enabled
 *
 * @param browserNotificationsEnabled - Whether browser notifications are enabled in config
 * @returns True if notifications can be sent
 *
 * @example
 * if (canSendBrowserNotification(config.browserNotificationsEnabled)) {
 *   sendBrowserNotification('Task text', 'task-id');
 * }
 */
export function canSendBrowserNotification(browserNotificationsEnabled: boolean): boolean {
  // Check if feature is enabled in config
  if (!browserNotificationsEnabled) {
    return false;
  }

  // Check if browser supports notifications
  if (!('Notification' in window)) {
    return false;
  }

  // Check if permission is granted
  if (Notification.permission !== 'granted') {
    return false;
  }

  return true;
}
