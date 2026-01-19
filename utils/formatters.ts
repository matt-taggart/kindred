type FormatBirthdayDisplayOptions = {
  includeYear?: boolean;
};

/**
 * Formats a birthday string for display.
 * Handles both "YYYY-MM-DD" and "MM-DD" formats.
 * @returns Formatted string like "March 15" or "March 15, 1990"
 */
export const formatBirthdayDisplay = (
  birthday: string,
  options: FormatBirthdayDisplayOptions = {},
): string => {
  const parts = birthday.split('-');
  const hasYear = parts.length === 3;
  const year = hasYear ? parseInt(parts[0], 10) : undefined;
  const month = parseInt(hasYear ? parts[1] : parts[0], 10);
  const day = parseInt(hasYear ? parts[2] : parts[1], 10);

  const date = new Date(hasYear && year ? year : 2000, month - 1, day);
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    ...(options.includeYear && hasYear ? { year: 'numeric' } : {}),
  };
  return date.toLocaleDateString('en-US', formatOptions);
};
