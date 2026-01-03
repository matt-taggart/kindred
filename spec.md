Implement the Data Access Layer using Drizzle.
1. Create `services/contactService.ts`:
   - `addContact(contact)`: Inserts a contact.
   - `getContacts()`: Returns contacts sorted by `nextContactDate` ASC (overdue first).
   - `updateInteraction(contactId, type, notes)`: Creates an Interaction record AND updates the Contact's `lastContactedAt` and `nextContactDate`.
2. Implement the frequency logic in a helper `utils/scheduler.ts`:
   - Weekly = +7 days, Monthly = +30 days, etc.
   - Use this helper inside `updateInteraction` to calculate the new `nextContactDate`.
3. Create a seed script that checks if the DB is empty and inserts 3 dummy contacts for testing.
