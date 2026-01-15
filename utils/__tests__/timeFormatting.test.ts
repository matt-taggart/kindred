import { formatLastConnected, formatNextReminder, getClockColor } from '../timeFormatting';

describe('formatLastConnected - specific days', () => {
  const NOW = new Date('2026-01-15T12:00:00Z').getTime();
  const DAY = 24 * 60 * 60 * 1000;

  it('returns "Connected today" for same day', () => {
    expect(formatLastConnected(NOW - 1000, NOW)).toBe('Connected today');
  });

  it('returns "Connected yesterday" for 1 day ago', () => {
    expect(formatLastConnected(NOW - DAY, NOW)).toBe('Connected yesterday');
  });

  it('returns "Connected 2 days ago" for 2 days', () => {
    expect(formatLastConnected(NOW - 2 * DAY, NOW)).toBe('Connected 2 days ago');
  });

  it('returns "Connected 3 days ago" for 3 days', () => {
    expect(formatLastConnected(NOW - 3 * DAY, NOW)).toBe('Connected 3 days ago');
  });

  it('returns "Connected 4 days ago" for 4 days', () => {
    expect(formatLastConnected(NOW - 4 * DAY, NOW)).toBe('Connected 4 days ago');
  });

  it('returns "Connected 5 days ago" for 5 days', () => {
    expect(formatLastConnected(NOW - 5 * DAY, NOW)).toBe('Connected 5 days ago');
  });

  it('returns "Connected 6 days ago" for 6 days', () => {
    expect(formatLastConnected(NOW - 6 * DAY, NOW)).toBe('Connected 6 days ago');
  });

  it('returns "Connected last week" for 7-13 days', () => {
    expect(formatLastConnected(NOW - 10 * DAY, NOW)).toBe('Connected last week');
  });

  it('returns "Connected 2 weeks ago" for 14-20 days', () => {
    expect(formatLastConnected(NOW - 16 * DAY, NOW)).toBe('Connected 2 weeks ago');
  });

  it('returns "Connected 3 weeks ago" for 21-29 days', () => {
    expect(formatLastConnected(NOW - 25 * DAY, NOW)).toBe('Connected 3 weeks ago');
  });

  it('returns "Connected last month" for 30-59 days', () => {
    expect(formatLastConnected(NOW - 45 * DAY, NOW)).toBe('Connected last month');
  });

  it('returns "Connected 2 months ago" for 60-89 days', () => {
    expect(formatLastConnected(NOW - 75 * DAY, NOW)).toBe('Connected 2 months ago');
  });

  it('returns "Connected 3 months ago" for 90-119 days', () => {
    expect(formatLastConnected(NOW - 100 * DAY, NOW)).toBe('Connected 3 months ago');
  });

  it('returns "Connected 4 months ago" for 120-149 days', () => {
    expect(formatLastConnected(NOW - 135 * DAY, NOW)).toBe('Connected 4 months ago');
  });

  it('returns "Connected 5 months ago" for 150-179 days', () => {
    expect(formatLastConnected(NOW - 165 * DAY, NOW)).toBe('Connected 5 months ago');
  });

  it('returns "It\'s been a while" for 180+ days', () => {
    expect(formatLastConnected(NOW - 200 * DAY, NOW)).toBe("It's been a while");
  });

  it('returns "Not reached out yet" for null/undefined', () => {
    expect(formatLastConnected(null, NOW)).toBe('Not reached out yet');
    expect(formatLastConnected(undefined, NOW)).toBe('Not reached out yet');
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

describe('getClockColor', () => {
  const NOW = new Date('2026-01-15T12:00:00Z').getTime();
  const DAY = 24 * 60 * 60 * 1000;

  it('returns sage for 0-14 days (recent)', () => {
    expect(getClockColor(NOW, NOW)).toBe('sage');
    expect(getClockColor(NOW - 7 * DAY, NOW)).toBe('sage');
    expect(getClockColor(NOW - 14 * DAY, NOW)).toBe('sage');
  });

  it('returns warmgray-muted for 15-60 days (neutral)', () => {
    expect(getClockColor(NOW - 15 * DAY, NOW)).toBe('warmgray-muted');
    expect(getClockColor(NOW - 30 * DAY, NOW)).toBe('warmgray-muted');
    expect(getClockColor(NOW - 60 * DAY, NOW)).toBe('warmgray-muted');
  });

  it('returns amber for 61+ days (attention)', () => {
    expect(getClockColor(NOW - 61 * DAY, NOW)).toBe('amber');
    expect(getClockColor(NOW - 120 * DAY, NOW)).toBe('amber');
  });

  it('returns amber for null (never contacted)', () => {
    expect(getClockColor(null, NOW)).toBe('amber');
  });
});
