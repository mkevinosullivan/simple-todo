/**
 * Announce a message to screen readers using a live region
 *
 * Creates a temporary live region element that announces the message
 * to screen readers, then removes it after the announcement.
 *
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive' for urgency
 *
 * @example
 * announceToScreenReader('Task completed: Buy groceries', 'polite');
 * announceToScreenReader('Error: Failed to save', 'assertive');
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden but announced
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement (1 second delay)
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
