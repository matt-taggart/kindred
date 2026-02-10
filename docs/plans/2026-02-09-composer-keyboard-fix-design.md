# Composer Sheet Keyboard Fix

## Problem

When typing a note in `InteractionComposerSheet`, the keyboard covers the text area and the Save button. The user gets stuck — they can't see what they're typing, can't dismiss the keyboard (multiline TextInput has no "Done" key), and can't reach Save.

## Solution

Two changes to `components/InteractionComposerSheet.tsx`, using only built-in `react-native` APIs (no new dependencies):

### 1. KeyboardAvoidingView wrapper

Wrap the sheet content in a `KeyboardAvoidingView` with `behavior="padding"` on iOS. This shifts the entire sheet upward when the keyboard appears, keeping the text area and Save button visible.

- The backdrop `Pressable` (dimmed overlay that calls `handleClose`) stays **outside** the `KeyboardAvoidingView` so tapping it still closes the sheet and dismisses the keyboard in one tap.
- Matches the existing pattern in `app/contacts/review-schedule.tsx`.

### 2. InputAccessoryView toolbar (iOS only)

Add an `InputAccessoryView` tied to the TextInput via a shared `nativeID`. This renders a small bar docked above the keyboard with a "Done" button that calls `Keyboard.dismiss()`.

- Standard iOS keyboard pattern — users expect it.
- On Android, the back button already dismisses the keyboard, so the accessory view is conditionally rendered via `Platform.OS === 'ios'`.
- Tapping the backdrop is a second escape route on both platforms.

## Scope

- **Single file change**: `components/InteractionComposerSheet.tsx`
- **New imports**: `KeyboardAvoidingView`, `InputAccessoryView`, `Keyboard`, `Platform` (all from `react-native`)
- **No new dependencies**
- **No visual changes** to the sheet itself — same layout, same styling

## Implementation Steps

1. Add imports: `KeyboardAvoidingView`, `InputAccessoryView`, `Keyboard`, `Platform`
2. Define an `inputAccessoryViewID` constant (e.g. `'composer-note-toolbar'`)
3. Wrap the inner `Pressable` (sheet content) with `KeyboardAvoidingView` using `behavior="padding"` on iOS
4. Add `inputAccessoryViewID` prop to the `TextInput`
5. Add `InputAccessoryView` component (iOS only) with a "Done" button that calls `Keyboard.dismiss()`
