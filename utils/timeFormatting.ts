const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatLastConnected(
  timestamp: number | null | undefined,
  now: number = Date.now()
): string {
  if (!timestamp) return 'Never';

  const diff = Math.max(0, now - timestamp);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Today';
  if (days <= 2) return 'Connected recently';
  if (days <= 14) return 'Connected last week';
  if (days <= 45) return 'Connected last month';
  return "It's been a while";
}

export function formatNextReminder(
  timestamp: number | null | undefined,
  now: number = Date.now()
): string {
  if (!timestamp) return 'Not scheduled';

  const diff = timestamp - now;
  if (diff <= 0) return 'Today';

  const days = Math.ceil(diff / DAY_IN_MS);
  // If less than a full day away, it's still "Today"
  if (days <= 1 && diff < DAY_IN_MS) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 14) return `In ${days} days`;

  const weeks = Math.floor(days / 7);
  return `In ${weeks} weeks`;
}
