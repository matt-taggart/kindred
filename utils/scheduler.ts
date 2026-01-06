import { Contact } from '../db/schema';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type FrequencyBucket = Contact['bucket'];

const bucketOffsets: Record<Exclude<FrequencyBucket, 'custom'>, number> = {
  daily: 1,
  weekly: 7,
  'bi-weekly': 14,
  'every-three-weeks': 21,
  monthly: 30,
  'every-six-months': 182,
  yearly: 365,
};

export const getNextContactDate = (
  bucket: FrequencyBucket,
  fromDate: number = Date.now(),
  customIntervalDays?: number | null,
): number => {
  if (bucket === 'custom') {
    if (!customIntervalDays || customIntervalDays < 1) {
      throw new Error('Custom reminders require a valid interval in days');
    }
    return fromDate + customIntervalDays * DAY_IN_MS;
  }

  const days = bucketOffsets[bucket];

  if (!days) {
    throw new Error(`Unsupported bucket: ${bucket}`);
  }

  return fromDate + days * DAY_IN_MS;
};
