# Connection Settings Modal Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor EditContactModal to match the new Kindred design language with heart icon header, radio-style rhythm cards, warm accent sections, and refined action buttons.

**Architecture:** Single file refactor of `components/EditContactModal.tsx` with supporting color token additions. Preserves all existing state management, handlers, and business logic while completely restyling the UI.

**Tech Stack:** React Native, NativeWind (Tailwind), Expo, TypeScript

---

## Task 1: Add Missing Color Tokens

**Files:**
- Modify: `tailwind.config.js:8-24`

**Step 1: Add the missing color tokens**

Add these colors to the `colors` object in `tailwind.config.js`:

```javascript
// Inside theme.extend.colors:
'accent-warm': '#E8D5C4',
'card-light': '#FFFFFF',
'card-dark': '#2D2D2A',
```

**Step 2: Verify the config is valid**

Run: `npx tailwindcss --help`
Expected: No syntax errors, help output displays

**Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add accent-warm and card color tokens for connection settings redesign"
```

---

## Task 2: Refactor Header Section

**Files:**
- Modify: `components/EditContactModal.tsx:199-209`

**Step 1: Replace the header with new design**

Replace the current header (lines 199-209) with:

```tsx
<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
  <View className="flex-1 px-6 pb-6">
    {/* Header */}
    <View className="py-4 flex-row items-center justify-between">
      <Pressable onPress={onClose}>
        <Text className="text-primary font-medium text-lg">Cancel</Text>
      </Pressable>
      <Text className="text-xl font-semibold text-slate-800 dark:text-white">
        Connection settings
      </Text>
      <View className="w-12" />
    </View>
```

**Step 2: Verify the app builds**

Run: `npx expo start --clear` (then press `i` for iOS simulator)
Expected: App launches, modal header shows "Cancel" in sage green

**Step 3: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): update header with new design styling"
```

---

## Task 3: Add Profile Section (Heart Icon + Name + Tagline)

**Files:**
- Modify: `components/EditContactModal.tsx` (after header, before ScrollView)

**Step 1: Add profile section after header**

Insert this after the header `</View>` and before `<ScrollView>`:

```tsx
    {/* Profile Section */}
    <View className="items-center my-6">
      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-4">
        <Ionicons name="heart" size={28} color="#79947D" />
      </View>
      <Text className="text-2xl font-display text-slate-800 dark:text-white mb-2">
        {contact.name}
      </Text>
      <Text className="text-slate-500 dark:text-slate-400 italic">
        Every relationship has its own rhythm.
      </Text>
    </View>
```

**Step 2: Remove the old name/subtitle from ScrollView**

Delete lines that show contact.name and "How often would you like..." (currently lines 212-217).

**Step 3: Verify the modal displays correctly**

Run: Open modal in iOS simulator
Expected: Heart icon in circle, contact name in Playfair Display, italic tagline

**Step 4: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): add profile section with heart icon and tagline"
```

---

## Task 4: Restyle Rhythm Cards with Radio Indicators

**Files:**
- Modify: `components/EditContactModal.tsx:220-370`

**Step 1: Replace the rhythm cards section**

Replace the entire rhythm section (the `<View className="mb-4 flex gap-2">` and its contents) with:

```tsx
            {/* Rhythm Selection Cards */}
            <View className="space-y-4 mb-8">
              {(
                [
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly",
                  "custom",
                ] as Contact["bucket"][]
              ).map((bucket) => {
                const isSelected = selectedBucket === bucket;
                const isCustomSelected = bucket === "custom" && isSelected;

                return (
                  <View key={bucket}>
                    <Pressable
                      className={`p-5 bg-card-light dark:bg-card-dark rounded-3xl shadow-sm border-2 ${
                        isSelected
                          ? 'border-primary'
                          : 'border-transparent'
                      } ${isCustomSelected ? 'rounded-b-none' : ''}`}
                      onPress={() => {
                        setSelectedBucket(bucket);
                        if (bucket === "custom") {
                          const derived = deriveCustomUnitAndValue(
                            contact.customIntervalDays,
                          );
                          setCustomState(derived);
                        }
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-slate-800 dark:text-white">
                            {bucketLabels[bucket]}
                          </Text>
                          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {bucket === "custom"
                              ? formatCustomSummary(
                                  derivedCustomDays ?? contact.customIntervalDays,
                                )
                              : bucketDescriptions[bucket]}
                          </Text>
                        </View>
                        {/* Radio Indicator */}
                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && (
                            <View className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </View>
                      </View>
                    </Pressable>

                    {/* Custom Rhythm Expansion */}
                    {isCustomSelected && (
                      <View className="bg-slate-50 dark:bg-slate-800 rounded-b-3xl border-2 border-t-0 border-primary px-5 pb-5 pt-3">
                        <View className="gap-4">
                          <View>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              Frequency
                            </Text>
                            <View className="h-12 flex-row items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3">
                              <TextInput
                                value={customValue}
                                onChangeText={(text) =>
                                  setCustomState({
                                    customUnit,
                                    customValue: text.replace(/[^0-9]/g, ""),
                                  })
                                }
                                keyboardType="number-pad"
                                className="flex-1 text-base text-slate-800 dark:text-white"
                                placeholder="e.g., 30"
                                placeholderTextColor="#94a3b8"
                              />
                            </View>
                          </View>
                          <View>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              Unit
                            </Text>
                            <View className="flex-row gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
                              {(["days", "weeks", "months"] as CustomUnit[]).map(
                                (unit) => (
                                  <Pressable
                                    key={unit}
                                    onPress={() =>
                                      setCustomState({
                                        customUnit: unit,
                                        customValue,
                                      })
                                    }
                                    className={`flex-1 items-center justify-center rounded-lg py-2 ${
                                      customUnit === unit
                                        ? 'bg-slate-100 dark:bg-slate-700'
                                        : ''
                                    }`}
                                  >
                                    <Text
                                      className={`text-sm font-medium ${
                                        customUnit === unit
                                          ? 'text-slate-800 dark:text-white'
                                          : 'text-slate-500 dark:text-slate-400'
                                      }`}
                                    >
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </Text>
                                  </Pressable>
                                ),
                              )}
                            </View>
                          </View>
                        </View>

                        {!isCustomValid && (
                          <Text className="mt-4 text-sm text-red-500 font-medium">
                            Please enter a valid duration (1-365 days)
                          </Text>
                        )}

                        {isCustomValid && derivedCustomDays && (
                          <Text className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            {"We'll remind you "}
                            <Text className="font-semibold text-primary">
                              {formatCustomSummary(derivedCustomDays)}
                            </Text>
                            .
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
```

**Step 2: Verify rhythm cards display correctly**

Run: Open modal, tap different rhythm options
Expected: Cards have rounded-3xl corners, selected card has primary border, radio indicator shows white dot when selected

**Step 3: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): restyle rhythm cards with radio indicators"
```

---

## Task 5: Restyle Birthday Section with Warm Accent Background

**Files:**
- Modify: `components/EditContactModal.tsx` (birthday section)

**Step 1: Replace the birthday section**

Replace the birthday section with:

```tsx
            {/* Birthday Section */}
            <View className="mb-4 p-6 bg-accent-warm/20 dark:bg-primary/5 rounded-[32px] border border-accent-warm/30 dark:border-primary/20">
              {/* Header Row */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">🎂</Text>
                  <View>
                    <Text className="text-lg font-semibold text-slate-800 dark:text-white">
                      Birthday
                    </Text>
                    {birthday && !isBirthdayExpanded && (
                      <Text className="text-xs text-primary font-medium uppercase tracking-wider">
                        A gentle reminder is coming up
                      </Text>
                    )}
                  </View>
                </View>
                {isBirthdayExpanded ? (
                  <Pressable
                    onPress={() => setIsBirthdayExpanded(false)}
                    className="active:opacity-60"
                  >
                    <Text className="text-sm font-medium text-slate-500">
                      Cancel
                    </Text>
                  </Pressable>
                ) : birthday ? (
                  <Pressable
                    onPress={() => setIsBirthdayExpanded(true)}
                    className="active:opacity-60"
                  >
                    <Text className="text-sm font-bold text-primary">
                      Edit
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {/* Content */}
              {isBirthdayExpanded ? (
                <>
                  <View className="py-2">
                    <BirthdayPicker
                      value={birthday}
                      onChange={setBirthday}
                    />
                  </View>
                  <Text className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                    {"We'll prioritize this over regular reminders on their birthday."}
                  </Text>
                </>
              ) : birthday ? (
                <View className="py-2">
                  <Text className="text-xl font-display text-slate-700 dark:text-slate-300 text-center">
                    {formatBirthdayDisplay(birthday)}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => setIsBirthdayExpanded(true)}
                  className="py-2 items-center active:opacity-60"
                >
                  <View className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Ionicons name="add" size={18} color="#79947D" />
                    <Text className="text-sm font-medium text-primary">
                      Add Birthday
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
```

**Step 2: Verify birthday section styling**

Run: Open modal with contact that has/doesn't have birthday
Expected: Warm peach background, rounded-[32px], uppercase subtitle when birthday is set

**Step 3: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): restyle birthday section with warm accent background"
```

---

## Task 6: Restyle Next Reminder Section

**Files:**
- Modify: `components/EditContactModal.tsx` (next reminder section)

**Step 1: Replace the next reminder section**

Replace the next reminder section with:

```tsx
            {/* Next Reminder Section */}
            <View className="mb-4 p-6 bg-accent-warm/20 dark:bg-primary/5 rounded-[32px] border border-accent-warm/30 dark:border-primary/20">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <Ionicons name="calendar-outline" size={20} color="#79947D" />
                  </View>
                  <Text className="text-lg font-semibold text-slate-800 dark:text-white">
                    Next Reminder
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  className="active:opacity-60"
                >
                  <Text className="text-sm font-bold text-primary">
                    {showDatePicker ? 'Done' : 'Edit'}
                  </Text>
                </Pressable>
              </View>

              <View className="py-2">
                <Text className="text-xl font-display text-slate-700 dark:text-slate-300 text-center">
                  {getDateLabel(startDate.getTime())}
                </Text>
              </View>

              {showDatePicker && Platform.OS === 'ios' && (
                <View className="mt-4">
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={(_e, date) => date && setStartDate(date)}
                    themeVariant="light"
                    accentColor="#79947D"
                  />
                </View>
              )}

              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(_e, date) => {
                    setShowDatePicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>
```

**Step 2: Verify next reminder section styling**

Run: Open modal, tap Edit on next reminder
Expected: Matches birthday section styling, calendar icon in circle, date in Playfair Display

**Step 3: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): restyle next reminder section with warm accent background"
```

---

## Task 7: Restyle Action Buttons (Save + Archive)

**Files:**
- Modify: `components/EditContactModal.tsx` (bottom buttons)

**Step 1: Close the ScrollView and add styled buttons**

Replace the save button and archive button section with:

```tsx
          </ScrollView>

          {/* Action Buttons */}
          <View className="mt-6">
            <Pressable
              onPress={handleSave}
              disabled={saveDisabled}
              className={`w-full py-4 rounded-full items-center justify-center ${
                saveDisabled
                  ? 'bg-slate-200 dark:bg-slate-700'
                  : 'bg-primary'
              }`}
              style={!saveDisabled ? {
                shadowColor: "#79947D",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              } : undefined}
            >
              <Text
                className={`text-lg font-semibold ${
                  saveDisabled
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-white'
                }`}
              >
                Save changes
              </Text>
            </Pressable>

            {onArchive && !contact.isArchived && (
              <Pressable
                onPress={handleArchive}
                className="flex-row items-center justify-center gap-3 mt-8 active:opacity-70"
              >
                <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                  <Ionicons name="archive-outline" size={20} color="#94a3b8" />
                </View>
                <View>
                  <Text className="text-slate-600 dark:text-slate-400 font-medium">
                    Archive connection
                  </Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                    This connection has been resting
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
```

**Step 2: Verify action buttons styling**

Run: Open modal, check save button enabled/disabled states
Expected: Save button is rounded-full with shadow when enabled, archive has icon + two-line text

**Step 3: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): restyle action buttons with rounded-full save and archive with icon"
```

---

## Task 8: Final Cleanup and Testing

**Files:**
- Modify: `components/EditContactModal.tsx`

**Step 1: Remove any unused imports or styles**

Check for and remove any unused className references that don't match the new design.

**Step 2: Test complete flow**

Run through these scenarios:
1. Open modal for contact WITH birthday → verify all sections display
2. Open modal for contact WITHOUT birthday → verify "Add Birthday" button shows
3. Select different rhythms → verify radio indicator updates
4. Select custom rhythm → verify expansion panel works
5. Edit birthday → verify picker works
6. Edit next reminder → verify date picker works
7. Make changes and save → verify save button enables
8. Tap archive → verify confirmation dialog

**Step 3: Final commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat(EditContactModal): complete redesign with new Kindred design language"
```

---

## Summary

**Files Modified:**
- `tailwind.config.js` - Added 3 color tokens
- `components/EditContactModal.tsx` - Complete UI refactor

**Total Commits:** 8

**Key Changes:**
- Header: Cancel button in primary, centered title
- Profile: Heart icon + name (Playfair Display) + italic tagline
- Rhythm cards: rounded-3xl, border highlight, radio indicators
- Birthday: Warm accent background, rounded-[32px], uppercase subtitle
- Next Reminder: Matching warm accent styling
- Save button: rounded-full with shadow
- Archive: Icon in circle + two-line description
