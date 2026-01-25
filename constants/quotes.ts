export const DAILY_QUOTES = [
  "Real connection isn't about how often you talk, but how deeply you listen.",
  "The most precious gift we can offer anyone is our attention.",
  "In the rush of life, a moment of genuine presence is the greatest kindness.",
  "Nurturing relationships is like tending a garden — patience brings bloom.",
  "Every message sent with intention carries more weight than a thousand casual ones.",
  "Connection grows not from grand gestures, but from consistent small ones.",
  "The quality of your relationships determines the quality of your life.",
  "Being there for someone doesn't require being perfect, just being present.",
];

export function getDailyQuote(): string {
  // Use day of year to get consistent quote per day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
