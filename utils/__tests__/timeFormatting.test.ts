import { formatLastConnected, formatNextReminder } from '../timeFormatting';

describe('formatLastConnected', () => {
  const NOW = new Date('2026-01-13T12:00:00Z').getTime();

  it('returns "Today" for same day', () => {
    const timestamp = NOW - 1000 * 60 * 60; // 1 hour ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Today');
  });

  it('returns "Connected recently" for 1-2 days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 2; // 2 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Connected recently');
  });

  it('returns "Connected last week" for 3-14 days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 7; // 7 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Connected last week');
  });

  it('returns "Connected last month" for 15-45 days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 30; // 30 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Connected last month');
  });

  it('returns "It\'s been a while" for 46+ days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 60; // 60 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe("It's been a while");
  });

  it('returns "Never" for null/undefined', () => {
    expect(formatLastConnected(null, NOW)).toBe('Never');
    expect(formatLastConnected(undefined, NOW)).toBe('Never');
  });
});

describe('formatNextReminder', () => {
  const NOW = new Date('2026-01-13T12:00:00Z').getTime();

  it('returns "Today" for same day', () => {
    const timestamp = NOW + 1000 * 60 * 60; // 1 hour from now
    expect(formatNextReminder(timestamp, NOW)).toBe('Today');
  });

  it('returns "Tomorrow" for next day', () => {
    const timestamp = NOW + 1000 * 60 * 60 * 24; // 1 day from now
    expect(formatNextReminder(timestamp, NOW)).toBe('Tomorrow');
  });

  it('returns "In X days" for future dates', () => {
    const timestamp = NOW + 1000 * 60 * 60 * 24 * 5; // 5 days from now
    expect(formatNextReminder(timestamp, NOW)).toBe('In 5 days');
  });

  it('returns "In X weeks" for 2+ weeks', () => {
    const timestamp = NOW + 1000 * 60 * 60 * 24 * 14; // 14 days from now
    expect(formatNextReminder(timestamp, NOW)).toBe('In 2 weeks');
  });

  it('returns "Not scheduled" for null/undefined', () => {
    expect(formatNextReminder(null, NOW)).toBe('Not scheduled');
    expect(formatNextReminder(undefined, NOW)).toBe('Not scheduled');
  });
});
