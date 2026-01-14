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

export type CalendarContact = Contact & {
  isBirthday?: boolean;
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

export const getCalendarData = (): CalendarData => {
  const contacts = getContacts({ includeArchived: false });
  const calendarData: CalendarData = {};
  const currentYear = new Date().getFullYear();

  contacts.forEach((contact) => {
    // Handle regular contact dates
    if (contact.nextContactDate) {
      const dateKey = formatToDateKey(contact.nextContactDate);

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
    }

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

  return (contacts
    .map((contact) => {
      let isTargetDate = false;
      let isBirthday = false;

      // Check scheduled contact
      if (contact.nextContactDate) {
        const contactDateKey = formatToDateKey(contact.nextContactDate);
        if (contactDateKey === dateKey) {
          isTargetDate = true;
        }
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
  
  return contacts.filter((contact) => {
    let matches = false;

    if (contact.nextContactDate) {
      const contactDate = new Date(contact.nextContactDate);
      if (contactDate.getFullYear() === year && contactDate.getMonth() === month) {
        matches = true;
      }
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
