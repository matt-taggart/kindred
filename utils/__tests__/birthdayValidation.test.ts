import { validateBirthday, normalizeBirthday } from '../birthdayValidation';

describe('validateBirthday', () => {
  it('accepts empty string (optional field)', () => {
    expect(validateBirthday('')).toEqual({ valid: true });
    expect(validateBirthday('  ')).toEqual({ valid: true });
  });

  it('accepts valid MM/DD format', () => {
    expect(validateBirthday('03/15')).toEqual({ valid: true });
    expect(validateBirthday('12/31')).toEqual({ valid: true });
    expect(validateBirthday('01/01')).toEqual({ valid: true });
  });

  it('accepts valid MM-DD format', () => {
    expect(validateBirthday('03-15')).toEqual({ valid: true });
    expect(validateBirthday('12-31')).toEqual({ valid: true });
  });

  it('accepts single digit month/day', () => {
    expect(validateBirthday('3/5')).toEqual({ valid: true });
    expect(validateBirthday('1/1')).toEqual({ valid: true });
  });

  it('rejects invalid month', () => {
    expect(validateBirthday('13/15')).toEqual({ valid: false, error: 'Month must be 1-12' });
    expect(validateBirthday('00/15')).toEqual({ valid: false, error: 'Month must be 1-12' });
  });

  it('rejects invalid day for month', () => {
    expect(validateBirthday('02/30')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('04/31')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('03/00')).toEqual({ valid: false, error: 'Invalid day for this month' });
  });

  it('allows Feb 29 (leap year possibility)', () => {
    expect(validateBirthday('02/29')).toEqual({ valid: true });
  });

  it('rejects invalid format', () => {
    expect(validateBirthday('abc')).toEqual({ valid: false, error: 'Use format MM/DD' });
    expect(validateBirthday('123')).toEqual({ valid: false, error: 'Use format MM/DD' });
    expect(validateBirthday('03/15/1990')).toEqual({ valid: false, error: 'Use format MM/DD' });
  });
});

describe('normalizeBirthday', () => {
  it('normalizes to MM-DD format', () => {
    expect(normalizeBirthday('03/15')).toBe('03-15');
    expect(normalizeBirthday('3/5')).toBe('03-05');
    expect(normalizeBirthday('12-31')).toBe('12-31');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeBirthday('')).toBe('');
    expect(normalizeBirthday('  ')).toBe('');
  });

  it('returns empty string for invalid input', () => {
    expect(normalizeBirthday('abc')).toBe('');
    expect(normalizeBirthday('13/15')).toBe('');
  });
});
