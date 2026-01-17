export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getMaxDaysInMonth(month: number, year?: number): number {
  if (month === 2 && year !== undefined) {
    return isLeapYear(year) ? 29 : 28;
  }
  return MAX_DAYS_IN_MONTH[month - 1];
}

export function validateBirthday(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { valid: true };
  }

  const cleaned = trimmed.replace(/\//g, '-');
  const parts = cleaned.split('-');

  // YYYY-MM-DD format
  if (parts.length === 3) {
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2];

    if (!/^\d{4}$/.test(yearStr) || !/^\d{1,2}$/.test(monthStr) || !/^\d{1,2}$/.test(dayStr)) {
      return { valid: false, error: 'Use format YYYY-MM-DD or MM/DD' };
    }

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (year < 1900 || year > 2100) {
      return { valid: false, error: 'Invalid year' };
    }

    if (month < 1 || month > 12) {
      return { valid: false, error: 'Month must be 1-12' };
    }

    if (day < 1 || day > getMaxDaysInMonth(month, year)) {
      return { valid: false, error: 'Invalid day for this month' };
    }

    return { valid: true };
  }

  // MM-DD format
  if (parts.length === 2) {
    const monthStr = parts[0];
    const dayStr = parts[1];

    if (!/^\d{1,2}$/.test(monthStr) || !/^\d{1,2}$/.test(dayStr)) {
      return { valid: false, error: 'Use format MM/DD' };
    }

    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (month < 1 || month > 12) {
      return { valid: false, error: 'Month must be 1-12' };
    }

    if (day < 1 || day > MAX_DAYS_IN_MONTH[month - 1]) {
      return { valid: false, error: 'Invalid day for this month' };
    }

    return { valid: true };
  }

  return { valid: false, error: 'Use format MM/DD' };
}

export function normalizeBirthday(input: string): string {
  const trimmed = input.trim();

  if (trimmed === '') {
    return '';
  }

  const validation = validateBirthday(trimmed);
  if (!validation.valid) {
    return '';
  }

  const cleaned = trimmed.replace(/\//g, '-');
  const parts = cleaned.split('-');

  // YYYY-MM-DD format - keep as is but normalize padding
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // MM-DD format
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function hasYear(birthday: string): boolean {
  if (!birthday) return false;
  const parts = birthday.split('-');
  return parts.length === 3 && parts[0].length === 4;
}

export function getMonthDay(birthday: string): string {
  if (!birthday) return '';
  const parts = birthday.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return birthday;
}

export function getYear(birthday: string): number | null {
  if (!birthday) return null;
  const parts = birthday.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return parseInt(parts[0], 10);
  }
  return null;
}
