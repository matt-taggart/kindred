import { Contact } from '../db/schema';

export const DAY_IN_MS = 24 * 60 * 60 * 1000;

type FrequencyBucket = Contact['bucket'];

export const bucketOffsets: Record<Exclude<FrequencyBucket, 'custom'>, number> = {
  daily: 1,
  weekly: 7,
  'bi-weekly': 14,
  'every-three-weeks': 21,
  monthly: 30,
  'every-six-months': 182,
  yearly: 365,
};

export type DistributableContact = {
  id: string;
  name: string;
  bucket: FrequencyBucket;
  customIntervalDays?: number | null;
};

export type DistributionResult = {
  id: string;
  name: string;
  bucket: FrequencyBucket;
  nextContactDate: number;
  customIntervalDays?: number | null;
};

export const distributeContacts = (
  contacts: DistributableContact[],
  fromDate: number = Date.now(),
): DistributionResult[] => {
  if (contacts.length === 0) return [];

  const byBucket = new Map<FrequencyBucket, DistributableContact[]>();
  
  for (const contact of contacts) {
    const bucket = contact.bucket;
    if (!byBucket.has(bucket)) {
      byBucket.set(bucket, []);
    }
    byBucket.get(bucket)!.push(contact);
  }

  const results: DistributionResult[] = [];

  for (const [bucket, group] of byBucket.entries()) {
    let periodDays: number;
    
    if (bucket === 'custom') {
      periodDays = group[0]?.customIntervalDays ?? 30;
    } else {
      periodDays = bucketOffsets[bucket];
    }

    const spacing = group.length > 1 ? periodDays / group.length : 0;

    group.forEach((contact, index) => {
      const offsetDays = Math.floor(index * spacing);
      const nextContactDate = fromDate + offsetDays * DAY_IN_MS;
      
      results.push({
        id: contact.id,
        name: contact.name,
        bucket: contact.bucket,
        nextContactDate,
        customIntervalDays: contact.customIntervalDays,
      });
    });
  }

  return results;
};

export const getDateLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const groupByDate = (
  contacts: DistributionResult[],
): Map<string, DistributionResult[]> => {
  const grouped = new Map<string, DistributionResult[]>();

  for (const contact of contacts) {
    const dateKey = new Date(contact.nextContactDate).toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(contact);
  }

  return grouped;
};

export const getNextContactDate = (
  bucket: FrequencyBucket,
  fromDate: number = Date.now(),
  customIntervalDays?: number | null,
): number | null => {
  if (bucket === 'custom') {
    if (!customIntervalDays || customIntervalDays < 1) {
      return null;
    }
    return fromDate + customIntervalDays * DAY_IN_MS;
  }

  const days = bucketOffsets[bucket];

  if (!days) {
    throw new Error(`Unsupported bucket: ${bucket}`);
  }

  return fromDate + days * DAY_IN_MS;
};
