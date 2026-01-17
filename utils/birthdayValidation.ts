export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function validateBirthday(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { valid: true };
  }

  const cleaned = trimmed.replace(/\//g, '-');
  const parts = cleaned.split('-');

  if (parts.length !== 2) {
    return { valid: false, error: 'Use format MM/DD' };
  }

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
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);

  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
