import { buildContactDedupKey, normalizePhoneForComparison } from '../phone';

describe('phone dedupe helpers', () => {
  it('falls back to raw digits when formatted output is empty', () => {
    expect(normalizePhoneForComparison('1234567890')).toBe('1234567890');
  });

  it('normalizes common US country-code variants', () => {
    expect(normalizePhoneForComparison('+1 (415) 555-2671')).toBe('4155552671');
    expect(normalizePhoneForComparison('4155552671')).toBe('4155552671');
  });

  it('builds a stable dedupe key from normalized name and phone', () => {
    const keyA = buildContactDedupKey('John   Doe', '+1 (415) 555-2671');
    const keyB = buildContactDedupKey('john doe', '4155552671');
    expect(keyA).toBe(keyB);
  });
});
