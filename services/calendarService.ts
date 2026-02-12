import { getContacts } from './contactService';
import { Contact } from '../db/schema';
import { DAY_IN_MS, bucketOffsets } from '../utils/scheduler';

export type DayData = {
  marked: boolean;
  dots: { color: string }[];
  contactCount: number;
};

export type CalendarData = {
  [date: string]: DayData;
};

export type ContactByDate = {
  date: string;
  contacts: Contact[];
};

export type CalendarContact = Contact & {
  isBirthday?: boolean;
};

export type MomentContact = {
  contact: Contact;
  timeLabel: string;
  isUrgent: boolean;
  isResting: boolean;
  avatarIcon: string;
  rhythmLabel: string;
};

export type UpcomingMoments = {
  thisWeek: MomentContact[];
  nextWeek: MomentContact[];
  laterThisSeason: MomentContact[];
};

const formatToDateKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = (): string => {
  return formatToDateKey(Date.now());
};

const getBirthdayParts = (birthday: string): { month: number; day: number } | null => {
  try {
    let month: number;
    let day: number;

    if (birthday.length === 5) {
      // MM-DD
      [month, day] = birthday.split('-').map(Number);
    } else {
      // YYYY-MM-DD
      const parts = birthday.split('-').map(Number);
      month = parts[1];
      day = parts[2];
    }
    return { month, day };
  } catch (e) {
    return null;
  }
};

const getReminderIntervalMs = (contact: Contact): number | null => {
  if (contact.bucket === 'custom') {
    if (!contact.customIntervalDays || contact.customIntervalDays < 1) {
      return null;
    }
    return contact.customIntervalDays * DAY_IN_MS;
  }

  const days = bucketOffsets[contact.bucket];
  if (!days) return null;
  return days * DAY_IN_MS;
};

const getReminderOccurrencesInRange = (
  contact: Contact,
  rangeStartMs: number,
  rangeEndMs: number,
): number[] => {
  if (typeof contact.nextContactDate !== 'number') {
    return [];
  }

  if (rangeEndMs < rangeStartMs) {
    return [];
  }

  const intervalMs = getReminderIntervalMs(contact);
  if (!intervalMs) {
    if (
      contact.nextContactDate >= rangeStartMs &&
      contact.nextContactDate <= rangeEndMs
    ) {
      return [contact.nextContactDate];
    }
    return [];
  }

  const occurrences: number[] = [];
  let current = contact.nextContactDate;

  if (current < rangeStartMs) {
    const elapsed = rangeStartMs - current;
    const intervals = Math.ceil(elapsed / intervalMs);
    current += intervals * intervalMs;
  }

  while (current <= rangeEndMs) {
    occurrences.push(current);
    current += intervalMs;
  }

  return occurrences;
};

export const getCalendarData = (): CalendarData => {
  const contacts = getContacts({ includeArchived: false });
  const calendarData: CalendarData = {};
  const currentYear = new Date().getFullYear();
  const rangeStartMs = new Date(currentYear - 1, 0, 1).getTime();
  const rangeEndMs = new Date(currentYear + 1, 11, 31, 23, 59, 59, 999).getTime();

  contacts.forEach((contact) => {
    // Handle recurring reminder dates
    const reminderDates = getReminderOccurrencesInRange(contact, rangeStartMs, rangeEndMs);
    reminderDates.forEach((dateMs) => {
      const dateKey = formatToDateKey(dateMs);

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          marked: true,
          dots: [],
          contactCount: 0,
        };
      }

      calendarData[dateKey].dots.push({
        color: '#9CA986',
      });
      calendarData[dateKey].contactCount += 1;
    });

    // Handle birthdays - project for last, current, and next year
    if (contact.birthday) {
      const parts = getBirthdayParts(contact.birthday);
      if (parts) {
        const { month, day } = parts;
        
        // Generate dates for last year, current year, and next year
        [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
          const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          if (!calendarData[dateString]) {
            calendarData[dateString] = {
              marked: true,
              dots: [],
              contactCount: 0,
            };
          }

          // Check if we already have a birthday dot to avoid duplicates if something weird happens
          const hasBirthdayDot = calendarData[dateString].dots.some(d => d.color === '#D4896A');
          
          if (!hasBirthdayDot) {
            calendarData[dateString].dots.push({
              color: '#D4896A',
            });
            calendarData[dateString].contactCount += 1;
          }
        });
      }
    }
  });

  return calendarData;
};

export const getContactsByDate = (dateKey: string): CalendarContact[] => {
  const contacts = getContacts({ includeArchived: false });
  const [targetYear, targetMonth, targetDay] = dateKey.split('-').map(Number);
  const targetDateStartMs = new Date(targetYear, targetMonth - 1, targetDay).getTime();
  const targetDateEndMs = targetDateStartMs + DAY_IN_MS - 1;

  return (contacts
    .map((contact) => {
      let isTargetDate = false;
      let isBirthday = false;

      // Check scheduled contact
      if (getReminderOccurrencesInRange(contact, targetDateStartMs, targetDateEndMs).length > 0) {
        isTargetDate = true;
      }

      // Check birthday
      if (contact.birthday) {
        const parts = getBirthdayParts(contact.birthday);
        if (parts) {
          if (parts.month === targetMonth && parts.day === targetDay) {
            isTargetDate = true;
            isBirthday = true;
          }
        }
      }

      if (isTargetDate) {
        return { ...contact, isBirthday };
      }
      return null;
    })
    .filter((c) => c !== null) as CalendarContact[])
    .sort((a, b) => {
      if (a.isBirthday && !b.isBirthday) return -1;
      if (!a.isBirthday && b.isBirthday) return 1;

      return (a.nextContactDate || 0) - (b.nextContactDate || 0);
    });
};

export const getMonthsDueContacts = (year: number, month: number): number => {
  const contacts = getContacts({ includeArchived: false });
  const monthStartMs = new Date(year, month, 1).getTime();
  const monthEndMs = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

  return contacts.filter((contact) => {
    let matches = false;

    if (getReminderOccurrencesInRange(contact, monthStartMs, monthEndMs).length > 0) {
      matches = true;
    }

    if (!matches && contact.birthday) {
      const parts = getBirthdayParts(contact.birthday);
      // Month in getBirthdayParts is 1-based (from parsing string)
      // Month parameter is 0-based (from Date.getMonth())
      if (parts && (parts.month - 1) === month) {
        matches = true;
      }
    }

    return matches;
  }).length;
};

const getAvatarIconForRelationship = (relationship: string | null): string => {
  switch (relationship) {
    case 'partner':
    case 'spouse':
      return 'heart-outline';
    case 'family':
      return 'people-outline';
    case 'friend':
      return 'chatbubble-outline';
    case 'group':
      return 'people-circle-outline';
    default:
      return 'person-outline';
  }
};

const getRhythmLabel = (bucket: Contact['bucket']): string => {
  switch (bucket) {
    case 'daily':
      return 'Daily check-in';
    case 'weekly':
      return 'Weekly check-in';
    case 'bi-weekly':
      return 'Every 2 weeks';
    case 'every-three-weeks':
      return 'Every 3 weeks';
    case 'monthly':
      return 'Monthly check-in';
    case 'every-six-months':
      return 'Twice a year';
    case 'yearly':
      return 'Yearly check-in';
    case 'custom':
      return 'Custom schedule';
    default:
      return 'At your pace';
  }
};

const getTimeLabel = (timestamp: number): string => {
  const now = new Date();
  const date = new Date(timestamp);

  // Reset to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays <= 7) {
    // Return weekday name
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  // Return "Mon 12" format
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  return `${weekday} ${day}`;
};

export const getUpcomingMoments = (): UpcomingMoments => {
  const contacts = getContacts({ includeArchived: false });
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayMs = today.getTime();

  const thisWeek: MomentContact[] = [];
  const nextWeek: MomentContact[] = [];
  const laterThisSeason: MomentContact[] = [];

  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  const fourteenDaysMs = 14 * oneDayMs;
  const ninetyDaysMs = 90 * oneDayMs;

  contacts.forEach((contact) => {
    if (!contact.nextContactDate) return;

    const contactDate = new Date(contact.nextContactDate);
    const contactDateStart = new Date(
      contactDate.getFullYear(),
      contactDate.getMonth(),
      contactDate.getDate()
    );
    const diffMs = contactDateStart.getTime() - todayMs;

    // Skip if in the past or beyond 90 days
    if (diffMs < 0 || diffMs > ninetyDaysMs) return;

    const isUrgent = diffMs <= oneDayMs;
    const isResting = contact.bucket === 'every-six-months' || contact.bucket === 'yearly';

    const momentContact: MomentContact = {
      contact,
      timeLabel: getTimeLabel(contact.nextContactDate),
      isUrgent,
      isResting,
      avatarIcon: getAvatarIconForRelationship(contact.relationship),
      rhythmLabel: getRhythmLabel(contact.bucket),
    };

    if (diffMs <= sevenDaysMs) {
      thisWeek.push(momentContact);
    } else if (diffMs <= fourteenDaysMs) {
      nextWeek.push(momentContact);
    } else {
      laterThisSeason.push(momentContact);
    }
  });

  // Sort each array by nextContactDate
  const sortByDate = (a: MomentContact, b: MomentContact) =>
    (a.contact.nextContactDate || 0) - (b.contact.nextContactDate || 0);

  thisWeek.sort(sortByDate);
  nextWeek.sort(sortByDate);
  laterThisSeason.sort(sortByDate);

  return {
    thisWeek,
    nextWeek,
    laterThisSeason,
  };
};
