Implement Contact Import in `app/contacts/import.tsx`.
1. Install `expo-contacts`.
2. Create a button "Import from Phone".
3. On press, request permission. If granted, fetch all contacts with a phone number.
4. Render a multi-select list of contacts.
5. "Import Selected":
   - Save selected items to the DB.
   - Default bucket: 'Monthly'.
   - Navigate back to Home.
