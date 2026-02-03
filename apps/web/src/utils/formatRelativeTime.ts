/**
 * Format milliseconds to human-readable relative time
 * @param milliseconds - Age in milliseconds
 * @returns Human-readable string (e.g., "2 days ago", "5 hours ago")
 */
export function formatRelativeTime(milliseconds: number): string {
  // Error handling for invalid inputs
  if (
    typeof milliseconds !== 'number' ||
    isNaN(milliseconds) ||
    milliseconds < 0
  ) {
    console.warn('formatRelativeTime: Invalid milliseconds value', milliseconds);
    return 'just now'; // Fallback to safe default
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) {return 'just now';}
  if (minutes < 60)
    {return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;}
  if (hours < 24) {return `${hours} hour${hours > 1 ? 's' : ''} ago`;}
  if (days < 7) {return `${days} day${days > 1 ? 's' : ''} ago`;}
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}
