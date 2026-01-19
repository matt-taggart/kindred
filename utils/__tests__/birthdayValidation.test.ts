import { validateBirthday, normalizeBirthday, hasYear, getMonthDay, getYear, calculateTurningAge } from '../birthdayValidation';

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
    expect(validateBirthday('03/15/1990')).toEqual({ valid: false, error: 'Use format YYYY-MM-DD or MM/DD' });
  });
});

describe('validateBirthday with year', () => {
  it('accepts valid YYYY-MM-DD format', () => {
    expect(validateBirthday('1990-03-15')).toEqual({ valid: true });
    expect(validateBirthday('2000-12-31')).toEqual({ valid: true });
    expect(validateBirthday('1985-01-01')).toEqual({ valid: true });
  });

  it('rejects invalid year', () => {
    expect(validateBirthday('0000-03-15')).toEqual({ valid: false, error: 'Invalid year' });
    expect(validateBirthday('3000-03-15')).toEqual({ valid: false, error: 'Invalid year' });
  });

  it('rejects invalid month in YYYY-MM-DD', () => {
    expect(validateBirthday('1990-13-15')).toEqual({ valid: false, error: 'Month must be 1-12' });
    expect(validateBirthday('1990-00-15')).toEqual({ valid: false, error: 'Month must be 1-12' });
  });

  it('rejects invalid day in YYYY-MM-DD', () => {
    expect(validateBirthday('1990-02-30')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('1990-04-31')).toEqual({ valid: false, error: 'Invalid day for this month' });
  });

  it('allows Feb 29 in leap year', () => {
    expect(validateBirthday('2000-02-29')).toEqual({ valid: true });
    expect(validateBirthday('2004-02-29')).toEqual({ valid: true });
  });

  it('rejects Feb 29 in non-leap year', () => {
    expect(validateBirthday('1900-02-29')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('2001-02-29')).toEqual({ valid: false, error: 'Invalid day for this month' });
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

  it('normalizes YYYY-MM-DD format', () => {
    expect(normalizeBirthday('1990-03-15')).toBe('1990-03-15');
    expect(normalizeBirthday('2000-1-5')).toBe('2000-01-05');
    expect(normalizeBirthday('1985-12-31')).toBe('1985-12-31');
  });

  it('returns empty string for invalid YYYY-MM-DD input', () => {
    expect(normalizeBirthday('3000-03-15')).toBe('');
    expect(normalizeBirthday('1990-13-15')).toBe('');
  });
});

describe('hasYear', () => {
  it('returns true for YYYY-MM-DD format', () => {
    expect(hasYear('1990-03-15')).toBe(true);
    expect(hasYear('2000-12-31')).toBe(true);
  });

  it('returns false for MM-DD format', () => {
    expect(hasYear('03-15')).toBe(false);
    expect(hasYear('12-31')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasYear('')).toBe(false);
  });
});

describe('getMonthDay', () => {
  it('extracts MM-DD from YYYY-MM-DD', () => {
    expect(getMonthDay('1990-03-15')).toBe('03-15');
    expect(getMonthDay('2000-12-31')).toBe('12-31');
  });

  it('returns MM-DD as is', () => {
    expect(getMonthDay('03-15')).toBe('03-15');
    expect(getMonthDay('12-31')).toBe('12-31');
  });

  it('returns empty string for empty input', () => {
    expect(getMonthDay('')).toBe('');
  });
});

describe('getYear', () => {
  it('extracts year from YYYY-MM-DD', () => {
    expect(getYear('1990-03-15')).toBe(1990);
    expect(getYear('2000-12-31')).toBe(2000);
  });

  it('returns null for MM-DD format', () => {
    expect(getYear('03-15')).toBe(null);
    expect(getYear('12-31')).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(getYear('')).toBe(null);
  });
});

describe('calculateTurningAge', () => {
  it('returns age for birthday with year', () => {
    // Person born March 15, 1990. On March 15, 2026 they turn 36
    expect(calculateTurningAge('1990-03-15', new Date('2026-03-15'))).toBe(36);
  });

  it('returns null for birthday without year', () => {
    expect(calculateTurningAge('03-15', new Date('2026-03-15'))).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(calculateTurningAge('', new Date('2026-03-15'))).toBe(null);
  });

  it('returns null for invalid birthday', () => {
    expect(calculateTurningAge('invalid', new Date('2026-03-15'))).toBe(null);
  });

  it('calculates correct age for different years', () => {
    expect(calculateTurningAge('2000-12-25', new Date('2026-12-25'))).toBe(26);
    expect(calculateTurningAge('1985-01-01', new Date(2026, 0, 1))).toBe(41);
  });
});
