import { getContacts } from './contactService';
import { Contact } from '../db/schema';

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

const isOverdue = (contact: Contact): boolean => {
  if (!contact.nextContactDate) {
    return contact.lastContactedAt !== null;
  }
  return contact.nextContactDate <= Date.now();
};

export const getCalendarData = (): CalendarData => {
  const contacts = getContacts({ includeArchived: false });
  const calendarData: CalendarData = {};

  contacts.forEach((contact) => {
    if (!contact.nextContactDate) {
      return;
    }

    const dateKey = formatToDateKey(contact.nextContactDate);
    const isOverdueContact = isOverdue(contact);

    if (!calendarData[dateKey]) {
      calendarData[dateKey] = {
        marked: true,
        dots: [],
        contactCount: 0,
      };
    }

    calendarData[dateKey].dots.push({
      color: isOverdueContact ? '#D48158' : '#9CA986',
    });
    calendarData[dateKey].contactCount += 1;
  });

  return calendarData;
};

export const getContactsByDate = (dateKey: string): Contact[] => {
  const contacts = getContacts({ includeArchived: false });

  return contacts
    .filter((contact) => {
      if (!contact.nextContactDate) {
        return false;
      }

      const contactDateKey = formatToDateKey(contact.nextContactDate);
      return contactDateKey === dateKey;
    })
    .sort((a, b) => {
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return (a.nextContactDate || 0) - (b.nextContactDate || 0);
    });
};

export const getMonthsDueContacts = (year: number, month: number): number => {
  const contacts = getContacts({ includeArchived: false });
  
  return contacts.filter((contact) => {
    if (!contact.nextContactDate) {
      return false;
    }
    
    const contactDate = new Date(contact.nextContactDate);
    return contactDate.getFullYear() === year && contactDate.getMonth() === month;
  }).length;
};
