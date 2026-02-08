# Connection Settings UI Audit and Improvement Plan

## Scope
Screen: `components/EditContactModal.tsx` (Connection settings modal)
Goal: Improve visual polish, consistency with Kindred’s current design system, and interaction clarity while preserving existing behavior.

## Current-State Audit

### What is already strong
- Uses the current warm base palette (`background-light`, `accent-warm`, `primary`) and rounded card language.
- Has clear sections (rhythm, birthday, next reminder, archive).
- Includes custom rhythm expansion and good save-state guarding (`saveDisabled`).
- Supports dark mode and preserves existing business logic.

### Gaps to address
1. Typography consistency is mixed.
- Modal mostly uses raw `Text` class strings instead of shared primitives (`Heading`, `Body`, `Caption`), causing inconsistent weight/line-height vs other screens.

2. Visual hierarchy is too flat in the core form region.
- Rhythm cards, birthday, and next reminder all use similar weight; primary decision area (rhythm) does not stand out enough.

3. Selection affordance can be clearer.
- Radio indicators work, but inactive states and focus/press states are subtle; interaction feedback is weaker than newer tiles/buttons in contact detail.

4. Spacing rhythm is inconsistent.
- Section spacing and internal vertical rhythm vary (`mb-8`, `mb-4`, `mt-6`, `mt-8`) and doesn’t fully align to the 8pt cadence used elsewhere.

5. Action area hierarchy can be improved.
- `Save changes` and `Archive connection` are close in emphasis at the bottom; destructive affordance should be visually quieter until pressed.

6. Accessibility needs strengthening.
- Several controls lack explicit `accessibilityRole`, `accessibilityLabel`, and selected-state semantics.
- Some muted text (`text-slate-400/500`) on tinted backgrounds risks low contrast.

7. Token drift risk.
- Design docs mention older primary values, but active app tokens are `primary: #9DBEBB`. Modal should strictly follow code tokens, not legacy hex values.

## Design Direction
- Keep warm, gentle, quilt-inspired tone.
- Increase contrast and hierarchy through typography + spacing, not heavy color.
- Make rhythm selection feel like the primary task; birthday/reminder as supportive panels.
- Preserve current microcopy style (“gentle reminder”, “resting”).

## Implementation Plan

### Phase 1: Foundation and Consistency
Files:
- `components/EditContactModal.tsx`
- `components/ui/Heading.tsx` (only if missing variant needed)
- `components/ui/Body.tsx` (only if missing variant needed)

Tasks:
1. Replace major title/body/caption text blocks in modal with `Heading`, `Body`, `Caption` primitives.
2. Standardize section spacing with a consistent vertical rhythm:
- Header -> profile: 24
- Profile -> rhythm cards: 24
- Rhythm -> birthday: 16
- Birthday -> next reminder: 16
- Next reminder -> actions: 24
3. Normalize card paddings and corner language:
- Primary cards: `rounded-3xl`, `p-5`
- Supporting panels: `rounded-[32px]`, `p-6`

Acceptance criteria:
- Text styling matches other connection surfaces without one-off font tuning.
- Spacing looks intentional and consistent across iPhone small/large screens.

### Phase 2: Rhythm Card UX Upgrade
Files:
- `components/EditContactModal.tsx`

Tasks:
1. Increase primary emphasis of rhythm area:
- Add a small section label (`Caption` uppercase) above cards.
- Slightly reduce visual weight of secondary panels.
2. Improve selected/unselected/pressed states:
- Selected: `border-primary` + subtle tinted surface.
- Unselected: neutral border (`border-slate-200`) instead of transparent for clearer structure.
- Pressed: opacity/scale feedback with no layout shift.
3. Improve custom expansion readability:
- Keep inline expansion but increase separation with top divider and more explicit helper text.
- Ensure validation text always appears at consistent location.

Acceptance criteria:
- Users can identify the selected cadence within 1 glance.
- Custom panel feels integrated, not visually detached.

### Phase 3: Secondary Sections Refinement (Birthday + Next Reminder)
Files:
- `components/EditContactModal.tsx`

Tasks:
1. Align both sections to the same panel template:
- Icon/avatar column, title row, trailing action (`Edit/Done`).
2. Improve date readability:
- Use `Heading` for displayed date values and consistent center alignment.
3. Strengthen edit-mode clarity:
- Add subtle state cue when pickers are open (e.g., border tint + label state).
4. Keep existing platform-specific date picker behavior unchanged.

Acceptance criteria:
- Birthday and reminder sections feel like siblings in the same component family.
- Edit states are obvious without adding noise.

### Phase 4: Bottom Action Hierarchy + Safety
Files:
- `components/EditContactModal.tsx`

Tasks:
1. Keep `Save changes` as dominant CTA in a dedicated bottom action container.
2. De-emphasize archive row by default:
- Neutral icon/text at rest.
- Red tint only on press/active feedback.
3. Increase separation between primary and destructive actions.
4. Ensure disabled save state meets contrast and clearly communicates non-interactivity.

Acceptance criteria:
- Primary action is unmistakably dominant.
- Archive feels available but low-risk to tap accidentally.

### Phase 5: Accessibility + QA Hardening
Files:
- `components/EditContactModal.tsx`
- `components/ConnectionDetailHeader.test.tsx` (pattern reference)
- Add tests: `components/EditContactModal.test.tsx` (new)

Tasks:
1. Add accessibility metadata:
- `accessibilityRole` for all interactive controls.
- `accessibilityState={{ selected: true }}` for selected rhythm card.
- Descriptive labels for section edit toggles and save button states.
2. Add component tests:
- Renders selected rhythm correctly.
- Save button enables/disables based on change state and custom validation.
- Birthday expansion toggles correctly.
3. Manual QA on iOS and Android:
- Dark mode
- Long contact names
- Keyboard interactions in custom rhythm input
- Safe area + smaller screen devices

Acceptance criteria:
- VoiceOver/TalkBack announces control purpose and state correctly.
- No regressions in existing save/archive behavior.

## Execution Order
1. Phase 1 (foundation)
2. Phase 2 (rhythm UX)
3. Phase 3 (secondary panels)
4. Phase 4 (actions)
5. Phase 5 (a11y + tests + final QA)

## Out of Scope
- Changing business logic for cadence scheduling.
- Rewriting birthday/reminder data models.
- Reworking navigation or modal presentation style.

## Deliverables
- Updated `EditContactModal.tsx` with consistent design-system usage.
- Any minimal UI primitive extensions required for typography consistency.
- New `EditContactModal` tests for interaction and state coverage.
- Visual QA pass on iOS + Android for light/dark themes.
