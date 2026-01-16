# Notes Terminology Standardization

## Date
2026-01-15

## Problem
The app inconsistently uses "moments" and "notes" for the same feature—a memory aid for capturing things to remember after connecting with someone. "Shared moments" sounds like a journal entry, but the primary use case is quick capture after a conversation ("mentioned her sister's wedding is in June").

## Decision
Standardize on "Notes" terminology throughout. Clarity wins over evocative branding for a memory aid feature.

## Rationale
- Primary purpose is **memory aid**, not relationship journal
- Primary scenario is **after connecting** (retrospective capture)
- Users need to understand instantly: "I can write stuff here to remember later"
- "Notes" is universally understood with zero ambiguity

## Changes

### 1. Contact Details Page (`app/contacts/[id].tsx`)

| Element | Before | After |
|---------|--------|-------|
| Section header | "Shared moments" | "Notes" |
| Button | "Add moment" | "Add note" |
| Empty state | "Keep track of your moments here." | "Your notes will appear here" |

### 2. Modal (`app/modal.tsx`)

| Element | Before | After |
|---------|--------|-------|
| Header (add mode) | "Add a shared moment" | "Add a note" |
| Header (edit mode) | "Edit shared moment" | "Edit note" |

**Unchanged:**
- Prompt: "Anything you'd like to remember?"
- Placeholder: "Add a note for Maya..."
- "How did you connect?" interaction type selector

### 3. ReachedOutSheet (`components/ReachedOutSheet.tsx`)

| Element | Before | After |
|---------|--------|-------|
| Prompt | "Anyting you'd like to remember?" | "Anything you'd like to remember?" |

**Already correct:**
- Collapsed state: "Add a note (optional)"
- Placeholder: "Add a note for {name}"

## Out of Scope
- Icon changes (current `bookmarks-outline` icon is fine)
- Design proposal updates (DESIGN-PROPOSAL.md still uses "Shared moments" as historical reference)
