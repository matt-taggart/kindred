/**
 * Formats a birthday string for display.
 * Handles both "YYYY-MM-DD" and "MM-DD" formats.
 * @returns Formatted string like "March 15"
 */
export const formatBirthdayDisplay = (birthday: string): string => {
  const parts = birthday.split('-');
  const month = parseInt(parts.length === 3 ? parts[1] : parts[0], 10);
  const day = parseInt(parts.length === 3 ? parts[2] : parts[1], 10);

  const date = new Date(2000, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
