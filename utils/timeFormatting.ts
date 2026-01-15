const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatLastConnected(
  timestamp: number | null | undefined,
  now: number = Date.now()
): string {
  if (!timestamp) return 'Not reached out yet';

  const diff = Math.max(0, now - timestamp);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Connected today';
  if (days === 1) return 'Connected yesterday';
  if (days <= 6) return `Connected ${days} days ago`;
  if (days <= 13) return 'Connected last week';
  if (days <= 20) return 'Connected 2 weeks ago';
  if (days <= 29) return 'Connected 3 weeks ago';
  if (days <= 59) return 'Connected last month';
  if (days <= 89) return 'Connected 2 months ago';
  if (days <= 119) return 'Connected 3 months ago';
  if (days <= 149) return 'Connected 4 months ago';
  if (days <= 179) return 'Connected 5 months ago';
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
