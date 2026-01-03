Implement the Local Notification system.
1. Install `expo-notifications`.
2. Configure `app/_layout.tsx` to handle foreground notifications.
3. Create `services/notificationService.ts`:
   - `scheduleReminder(contact)`: Cancels existing ID, schedules a new notification for `contact.nextContactDate`.
   - Title: "Time to catch up with {name}"
   - Body: "It's been a while."
4. Hook this into the `updateInteraction` flow: whenever a contact is updated, reschedule their notification.
