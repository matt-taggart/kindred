import { Contact } from '../db/schema';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type FrequencyBucket = Contact['bucket'];

const bucketOffsets: Record<FrequencyBucket, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export const getNextContactDate = (
  bucket: FrequencyBucket,
  fromDate: number = Date.now(),
): number => {
  const days = bucketOffsets[bucket];

  if (!days) {
    throw new Error(`Unsupported bucket: ${bucket}`);
  }

  return fromDate + days * DAY_IN_MS;
};
