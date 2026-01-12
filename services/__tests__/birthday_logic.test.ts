// @ts-nocheck
import { getDueContacts, addContact, isBirthdayToday, getReminderPriority } from '../contactService';
import { getDb } from '../../db/client';
import { Contact } from '../../db/schema';

// Mock the DB and other dependencies if possible, but since we are in a CLI environment
// with a real DB (sqlite), we might want to use the real one if we can reset it.
// However, for unit tests without a full environment, we often mock.
// Given the existing setup, let's see if there are other tests to copy patterns from.
// app/contacts/__tests__/review_limit_spec.tsx exists.

describe('Birthday Logic', () => {
  // We will need to mock the implementation or assume a clean DB state.
  // For this plan, I'll write the test assuming we can run it, but I might not be able to 
  // fully execute it without setting up the Jest environment correctly (e.g. mocking expo-sqlite).
  // So I will write the test as a "Plan" and then implement the code to satisfy it.
  
  const TODAY_STR = '2026-01-11';
  const TODAY_MS = new Date(TODAY_STR).getTime();

  beforeAll(() => {
     // Setup mocks if needed
  });

  it('should identify if today is a contact\'s birthday', () => {
    // We need to implement isBirthdayToday
    const alice = { name: 'Alice', birthday: '1990-01-11' } as Contact;
    const bob = { name: 'Bob', birthday: '1990-05-20' } as Contact;
    
    // We need to pass the "current date" to the function or mock system time
    // For simplicity, let's assume isBirthdayToday takes a reference date or defaults to now.
    expect(isBirthdayToday(alice, new Date(TODAY_STR))).toBe(true);
    expect(isBirthdayToday(bob, new Date(TODAY_STR))).toBe(false);
  });

  it('should prioritize Birthday over Standard reminder', () => {
    const contact = {
      name: 'Bob',
      nextContactDate: TODAY_MS - 1000, // Overdue
      birthday: '1985-01-11' // Today
    } as Contact;

    const priority = getReminderPriority(contact, new Date(TODAY_STR));
    expect(priority).toBe('birthday'); 
  });
  
  it('should prioritize Standard if it is not birthday', () => {
     const contact = {
      name: 'Bob',
      nextContactDate: TODAY_MS - 1000, // Overdue
      birthday: '1985-06-11' // Not Today
    } as Contact;

    const priority = getReminderPriority(contact, new Date(TODAY_STR));
    expect(priority).toBe('standard');
  });
});
