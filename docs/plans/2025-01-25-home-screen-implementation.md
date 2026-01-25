# Home Screen Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Home screen from a SectionList layout to a quilt grid layout with new header, quote card, and connection tiles.

**Architecture:** Create 4 new components (HomeHeader, DailySoftnessCard, ConnectionTile, AddConnectionTile) with tests, then refactor the Home screen to use them with the existing QuiltGrid component. Preserve all existing functionality (loading, refresh, snooze, reached out).

**Tech Stack:** React Native, Expo, NativeWind/Tailwind, Jest, @testing-library/react-native

---

### Task 1: Create HomeHeader Component Test

**Files:**
- Create: `components/HomeHeader.test.tsx`

**Step 1: Write the failing test**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeHeader } from './HomeHeader';

describe('HomeHeader', () => {
  const mockOnAvatarPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders greeting with user name', () => {
    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Sarah/)).toBeTruthy();
  });

  it('renders Kindred title', () => {
    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText('Kindred')).toBeTruthy();
  });

  it('shows morning greeting before noon', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-25T09:00:00'));

    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Good morning/)).toBeTruthy();

    jest.useRealTimers();
  });

  it('shows afternoon greeting after noon', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-25T14:00:00'));

    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Good afternoon/)).toBeTruthy();

    jest.useRealTimers();
  });

  it('shows evening greeting after 6pm', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-25T19:00:00'));

    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Good evening/)).toBeTruthy();

    jest.useRealTimers();
  });

  it('calls onAvatarPress when avatar is pressed', () => {
    const { getByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    fireEvent.press(getByTestId('avatar-button'));
    expect(mockOnAvatarPress).toHaveBeenCalledTimes(1);
  });

  it('shows notification badge when hasNotification is true', () => {
    const { getByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} hasNotification />
    );
    expect(getByTestId('notification-badge')).toBeTruthy();
  });

  it('hides notification badge when hasNotification is false', () => {
    const { queryByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} hasNotification={false} />
    );
    expect(queryByTestId('notification-badge')).toBeNull();
  });

  it('renders avatar image when avatarUri is provided', () => {
    const { getByTestId } = render(
      <HomeHeader
        userName="Sarah"
        onAvatarPress={mockOnAvatarPress}
        avatarUri="https://example.com/avatar.jpg"
      />
    );
    expect(getByTestId('avatar-image')).toBeTruthy();
  });

  it('renders default avatar when avatarUri is not provided', () => {
    const { getByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByTestId('default-avatar')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="HomeHeader.test" --watchAll=false`
Expected: FAIL with "Cannot find module './HomeHeader'"

**Step 3: Commit test file**

```bash
git add components/HomeHeader.test.tsx
git commit -m "test: add HomeHeader component tests"
```

---

### Task 2: Implement HomeHeader Component

**Files:**
- Create: `components/HomeHeader.tsx`

**Step 1: Write minimal implementation**

```tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body } from './ui';

type HomeHeaderProps = {
  userName: string;
  avatarUri?: string | null;
  hasNotification?: boolean;
  onAvatarPress: () => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHeader({
  userName,
  avatarUri,
  hasNotification = false,
  onAvatarPress
}: HomeHeaderProps) {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <View className="flex-row justify-between items-center mb-8">
      <View>
        <Body size="sm" muted>{greeting}, {userName}</Body>
        <Heading size={1} className="mt-1">Kindred</Heading>
      </View>

      <TouchableOpacity
        onPress={onAvatarPress}
        testID="avatar-button"
        className="relative"
      >
        <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-soft">
          {avatarUri ? (
            <Image
              testID="avatar-image"
              source={{ uri: avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View
              testID="default-avatar"
              className="w-full h-full bg-primary items-center justify-center"
            >
              <Ionicons name="person" size={24} color="white" />
            </View>
          )}
        </View>

        {hasNotification && (
          <View
            testID="notification-badge"
            className="absolute -top-1 -right-1 w-4 h-4 bg-secondary border-2 border-background-light dark:border-background-dark rounded-full"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- --testPathPattern="HomeHeader.test" --watchAll=false`
Expected: PASS (all 10 tests)

**Step 3: Commit implementation**

```bash
git add components/HomeHeader.tsx
git commit -m "feat: implement HomeHeader component"
```

---

### Task 3: Create DailySoftnessCard Component Test

**Files:**
- Create: `components/DailySoftnessCard.test.tsx`

**Step 1: Write the failing test**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DailySoftnessCard } from './DailySoftnessCard';

describe('DailySoftnessCard', () => {
  const mockOnReflectPress = jest.fn();
  const testQuote = "Real connection isn't about how often you talk, but how deeply you listen.";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Daily Softness title', () => {
    const { getByText } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByText('Daily Softness')).toBeTruthy();
  });

  it('renders the quote', () => {
    const { getByText } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByText(`"${testQuote}"`)).toBeTruthy();
  });

  it('renders Reflect button', () => {
    const { getByText } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByText('Reflect')).toBeTruthy();
  });

  it('calls onReflectPress when Reflect button is pressed', () => {
    const { getByTestId } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    fireEvent.press(getByTestId('reflect-button'));
    expect(mockOnReflectPress).toHaveBeenCalledTimes(1);
  });

  it('renders sparkle icon', () => {
    const { getByTestId } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByTestId('sparkle-icon')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="DailySoftnessCard.test" --watchAll=false`
Expected: FAIL with "Cannot find module './DailySoftnessCard'"

**Step 3: Commit test file**

```bash
git add components/DailySoftnessCard.test.tsx
git commit -m "test: add DailySoftnessCard component tests"
```

---

### Task 4: Implement DailySoftnessCard Component

**Files:**
- Create: `components/DailySoftnessCard.tsx`

**Step 1: Write minimal implementation**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui';
import Colors from '@/constants/Colors';

type DailySoftnessCardProps = {
  quote: string;
  onReflectPress: () => void;
};

export function DailySoftnessCard({ quote, onReflectPress }: DailySoftnessCardProps) {
  return (
    <View className="bg-primary/10 dark:bg-primary/20 p-6 rounded-2xl relative overflow-hidden mb-10">
      <View className="relative z-10">
        <View className="flex-row items-center gap-2 mb-2">
          <Ionicons
            testID="sparkle-icon"
            name="sparkles"
            size={20}
            color={Colors.primary}
          />
          <Body size="lg" weight="medium">Daily Softness</Body>
        </View>

        <Body size="sm" muted className="mb-4 italic">
          "{quote}"
        </Body>

        <TouchableOpacity
          testID="reflect-button"
          onPress={onReflectPress}
          className="bg-white/80 dark:bg-slate-800/80 self-start px-4 py-2 rounded-full flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <Body size="sm" weight="medium">Reflect</Body>
          <Ionicons name="arrow-forward" size={14} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Decorative blur circle */}
      <View className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full" />
    </View>
  );
}
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- --testPathPattern="DailySoftnessCard.test" --watchAll=false`
Expected: PASS (all 5 tests)

**Step 3: Commit implementation**

```bash
git add components/DailySoftnessCard.tsx
git commit -m "feat: implement DailySoftnessCard component"
```

---

### Task 5: Create ConnectionTile Component Test

**Files:**
- Create: `components/ConnectionTile.test.tsx`

**Step 1: Write the failing test**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionTile } from './ConnectionTile';
import { Contact } from '@/db/schema';

describe('ConnectionTile', () => {
  const mockOnPress = jest.fn();

  const baseContact: Contact = {
    id: '1',
    name: 'Emma',
    phone: '+1234567890',
    email: null,
    birthday: null,
    frequency: 7,
    relationship: 'partner',
    lastContactedAt: Date.now() - 86400000, // 1 day ago
    nextContactAt: Date.now(),
    snoozedUntil: null,
    avatarUri: null,
    notes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByText('Emma')).toBeTruthy();
  });

  it('calls onPress when tile is pressed', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    fireEvent.press(getByTestId('connection-tile'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders relationship type badge', () => {
    const { getByText } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByText('PARTNER')).toBeTruthy();
  });

  it('renders status text', () => {
    const { getByText } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByText(/Connected recently|day/)).toBeTruthy();
  });

  it('applies secondary variant styling for partner relationship', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} variant="secondary" onPress={mockOnPress} />
    );
    const tile = getByTestId('connection-tile');
    expect(tile.props.className).toContain('secondary');
  });

  it('applies primary variant styling for family relationship', () => {
    const familyContact = { ...baseContact, relationship: 'family' };
    const { getByTestId } = render(
      <ConnectionTile contact={familyContact} variant="primary" onPress={mockOnPress} />
    );
    const tile = getByTestId('connection-tile');
    expect(tile.props.className).toContain('primary');
  });

  it('renders large size with larger styling', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} size="large" onPress={mockOnPress} />
    );
    const tile = getByTestId('connection-tile');
    expect(tile.props.className).toContain('large');
  });

  it('renders birthday indicator for birthday contacts', () => {
    const birthdayContact = {
      ...baseContact,
      birthday: new Date().toISOString().slice(5, 10) // Today's date MM-DD
    };
    const { getByText } = render(
      <ConnectionTile contact={birthdayContact} isBirthday onPress={mockOnPress} />
    );
    expect(getByText('🎂')).toBeTruthy();
  });

  it('renders relationship icon', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByTestId('relationship-icon')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="ConnectionTile.test" --watchAll=false`
Expected: FAIL with "Cannot find module './ConnectionTile'"

**Step 3: Commit test file**

```bash
git add components/ConnectionTile.test.tsx
git commit -m "test: add ConnectionTile component tests"
```

---

### Task 6: Implement ConnectionTile Component

**Files:**
- Create: `components/ConnectionTile.tsx`

**Step 1: Write minimal implementation**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Caption, Body } from './ui';
import { Contact } from '@/db/schema';
import Colors from '@/constants/Colors';
import { formatLastConnected } from '@/utils/timeFormatting';

type ConnectionTileProps = {
  contact: Contact;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'standard' | 'large';
  isBirthday?: boolean;
  onPress: () => void;
};

const variantStyles = {
  primary: {
    bg: 'bg-primary/15 dark:bg-primary/20',
    border: 'border-primary/20',
    iconBg: 'bg-primary/30',
    iconColor: Colors.primary,
    badgeColor: 'text-primary/70',
  },
  secondary: {
    bg: 'bg-secondary/15 dark:bg-secondary/20',
    border: 'border-secondary/20',
    iconBg: 'bg-secondary/30',
    iconColor: Colors.secondary,
    badgeColor: 'text-secondary/70',
  },
  accent: {
    bg: 'bg-accent/40 dark:bg-accent/10',
    border: 'border-accent/60',
    iconBg: 'bg-accent/80 dark:bg-accent/20',
    iconColor: '#F97316', // orange-400
    badgeColor: 'text-orange-400/70',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-white dark:bg-slate-700',
    iconColor: '#9ca3af', // slate-400
    badgeColor: 'text-slate-400',
  },
};

const relationshipIcons: Record<string, string> = {
  partner: 'heart',
  spouse: 'heart',
  family: 'home',
  friend: 'leaf',
  mentor: 'school',
  colleague: 'briefcase',
  other: 'person',
};

function getRelationshipIcon(relationship: string | null): string {
  if (!relationship) return 'person';
  return relationshipIcons[relationship.toLowerCase()] || 'person';
}

function getStatusText(contact: Contact, isBirthday?: boolean): string {
  if (isBirthday) {
    return `It's ${contact.name}'s birthday! 🎂`;
  }

  const lastContacted = contact.lastContactedAt;
  if (!lastContacted) {
    return 'Not yet connected';
  }

  const daysSince = Math.floor((Date.now() - lastContacted) / (1000 * 60 * 60 * 24));

  if (daysSince === 0) return 'Connected today';
  if (daysSince === 1) return 'Connected yesterday';
  if (daysSince < 7) return 'Connected recently';
  return `${daysSince} days since last talk`;
}

export function ConnectionTile({
  contact,
  variant = 'neutral',
  size = 'standard',
  isBirthday = false,
  onPress
}: ConnectionTileProps) {
  const styles = variantStyles[variant];
  const iconName = getRelationshipIcon(contact.relationship);
  const statusText = getStatusText(contact, isBirthday);
  const relationshipLabel = contact.relationship?.toUpperCase() || 'CONNECTION';

  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-8 h-8';
  const iconContainerSize = size === 'large' ? 'rounded-2xl' : 'rounded-xl';
  const nameSize = size === 'large' ? 3 : 4;

  return (
    <TouchableOpacity
      testID="connection-tile"
      onPress={onPress}
      activeOpacity={0.7}
      className={`
        ${styles.bg}
        ${styles.border}
        border
        p-5
        rounded-3xl
        flex-col
        justify-between
        ${size === 'large' ? 'large' : ''}
      `}
    >
      <View className="flex-row justify-between items-start">
        <View
          testID="relationship-icon"
          className={`${iconSize} ${iconContainerSize} ${styles.iconBg} items-center justify-center`}
        >
          <Ionicons
            name={iconName as any}
            size={size === 'large' ? 20 : 16}
            color={styles.iconColor}
          />
        </View>
        <Caption className={styles.badgeColor}>{relationshipLabel}</Caption>
      </View>

      <View className={size === 'large' ? 'mt-auto' : 'mt-3'}>
        <View className="flex-row items-center gap-1">
          <Heading size={nameSize}>{contact.name}</Heading>
          {isBirthday && <Body>🎂</Body>}
        </View>
        <Caption muted className="mt-1">{statusText}</Caption>
      </View>
    </TouchableOpacity>
  );
}
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- --testPathPattern="ConnectionTile.test" --watchAll=false`
Expected: PASS (all 9 tests)

**Step 3: Commit implementation**

```bash
git add components/ConnectionTile.tsx
git commit -m "feat: implement ConnectionTile component"
```

---

### Task 7: Create AddConnectionTile Component Test

**Files:**
- Create: `components/AddConnectionTile.test.tsx`

**Step 1: Write the failing test**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddConnectionTile } from './AddConnectionTile';

describe('AddConnectionTile', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders add icon', () => {
    const { getByTestId } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    expect(getByTestId('add-icon')).toBeTruthy();
  });

  it('renders "Add a connection" text', () => {
    const { getByText } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    expect(getByText('Add a connection')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    fireEvent.press(getByTestId('add-connection-tile'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has dashed border style', () => {
    const { getByTestId } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    const tile = getByTestId('add-connection-tile');
    expect(tile.props.className).toContain('border-dashed');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="AddConnectionTile.test" --watchAll=false`
Expected: FAIL with "Cannot find module './AddConnectionTile'"

**Step 3: Commit test file**

```bash
git add components/AddConnectionTile.test.tsx
git commit -m "test: add AddConnectionTile component tests"
```

---

### Task 8: Implement AddConnectionTile Component

**Files:**
- Create: `components/AddConnectionTile.tsx`

**Step 1: Write minimal implementation**

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui';

type AddConnectionTileProps = {
  onPress: () => void;
};

export function AddConnectionTile({ onPress }: AddConnectionTileProps) {
  return (
    <TouchableOpacity
      testID="add-connection-tile"
      onPress={onPress}
      activeOpacity={0.7}
      className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-3xl flex-col items-center justify-center gap-2"
    >
      <View
        testID="add-icon"
        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#9ca3af" />
      </View>
      <Body size="sm" muted>Add a connection</Body>
    </TouchableOpacity>
  );
}
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- --testPathPattern="AddConnectionTile.test" --watchAll=false`
Expected: PASS (all 4 tests)

**Step 3: Commit implementation**

```bash
git add components/AddConnectionTile.tsx
git commit -m "feat: implement AddConnectionTile component"
```

---

### Task 9: Export New Components

**Files:**
- Modify: `components/index.ts` (or create if doesn't exist)

**Step 1: Check if index.ts exists and add exports**

If `components/index.ts` doesn't exist, create it. Add exports for the new components:

```tsx
// If file exists, add these lines. If not, create with these contents:
export { HomeHeader } from './HomeHeader';
export { DailySoftnessCard } from './DailySoftnessCard';
export { ConnectionTile } from './ConnectionTile';
export { AddConnectionTile } from './AddConnectionTile';
```

**Step 2: Run all new component tests**

Run: `npm test -- --testPathPattern="(HomeHeader|DailySoftnessCard|ConnectionTile|AddConnectionTile)" --watchAll=false`
Expected: PASS (all 28 tests across 4 test files)

**Step 3: Commit exports**

```bash
git add components/index.ts
git commit -m "feat: export new home screen components"
```

---

### Task 10: Create Utility Function for Tile Variant Assignment

**Files:**
- Create: `utils/tileVariant.ts`
- Create: `utils/tileVariant.test.ts`

**Step 1: Write the failing test**

```tsx
// utils/tileVariant.test.ts
import { getTileVariant, getTileSize } from './tileVariant';
import { Contact } from '@/db/schema';

describe('tileVariant utilities', () => {
  const baseContact: Partial<Contact> = {
    id: '1',
    name: 'Test',
    relationship: null,
  };

  describe('getTileVariant', () => {
    it('returns secondary for partner relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'partner' } as Contact)).toBe('secondary');
    });

    it('returns secondary for spouse relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'spouse' } as Contact)).toBe('secondary');
    });

    it('returns primary for family relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'family' } as Contact)).toBe('primary');
    });

    it('returns accent for friend relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'friend' } as Contact)).toBe('accent');
    });

    it('returns neutral for other relationships', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'colleague' } as Contact)).toBe('neutral');
    });

    it('returns neutral for null relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: null } as Contact)).toBe('neutral');
    });

    it('returns secondary when isBirthday is true', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'friend' } as Contact, true)).toBe('secondary');
    });
  });

  describe('getTileSize', () => {
    it('returns large for partner relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: 'partner' } as Contact)).toBe('large');
    });

    it('returns large for spouse relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: 'spouse' } as Contact)).toBe('large');
    });

    it('returns standard for family relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: 'family' } as Contact)).toBe('standard');
    });

    it('returns standard for null relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: null } as Contact)).toBe('standard');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="tileVariant.test" --watchAll=false`
Expected: FAIL with "Cannot find module './tileVariant'"

**Step 3: Write minimal implementation**

```tsx
// utils/tileVariant.ts
import { Contact } from '@/db/schema';

export type TileVariant = 'primary' | 'secondary' | 'accent' | 'neutral';
export type TileSize = 'standard' | 'large';

export function getTileVariant(contact: Contact, isBirthday?: boolean): TileVariant {
  if (isBirthday) return 'secondary';

  const relationship = contact.relationship?.toLowerCase();

  switch (relationship) {
    case 'partner':
    case 'spouse':
      return 'secondary';
    case 'family':
      return 'primary';
    case 'friend':
      return 'accent';
    default:
      return 'neutral';
  }
}

export function getTileSize(contact: Contact): TileSize {
  const relationship = contact.relationship?.toLowerCase();

  if (relationship === 'partner' || relationship === 'spouse') {
    return 'large';
  }

  return 'standard';
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern="tileVariant.test" --watchAll=false`
Expected: PASS (all 11 tests)

**Step 5: Commit**

```bash
git add utils/tileVariant.ts utils/tileVariant.test.ts
git commit -m "feat: add tile variant utility functions"
```

---

### Task 11: Create Hardcoded Quotes Data

**Files:**
- Create: `constants/quotes.ts`

**Step 1: Create quotes data file**

```tsx
// constants/quotes.ts
export const DAILY_QUOTES = [
  "Real connection isn't about how often you talk, but how deeply you listen.",
  "The most precious gift we can offer anyone is our attention.",
  "In the rush of life, a moment of genuine presence is the greatest kindness.",
  "Nurturing relationships is like tending a garden — patience brings bloom.",
  "Every message sent with intention carries more weight than a thousand casual ones.",
  "Connection grows not from grand gestures, but from consistent small ones.",
  "The quality of your relationships determines the quality of your life.",
  "Being there for someone doesn't require being perfect, just being present.",
];

export function getDailyQuote(): string {
  // Use day of year to get consistent quote per day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
```

**Step 2: Commit**

```bash
git add constants/quotes.ts
git commit -m "feat: add daily quotes data"
```

---

### Task 12: Refactor Home Screen - Part 1 (Setup and Imports)

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Update imports at top of file**

Replace the existing imports section with:

```tsx
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  LayoutAnimation,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  UIManager,
  View,
} from 'react-native';

import { Contact } from '@/db/schema';
import { getDueContactsGrouped, GroupedDueContacts, snoozeContact, isBirthdayToday, updateInteraction, getContactCount } from '@/services/contactService';
import EmptyContactsState from '@/components/EmptyContactsState';
import CelebrationStatus from '@/components/CelebrationStatus';
import ReachedOutSheet from '@/components/ReachedOutSheet';
import { HomeHeader } from '@/components/HomeHeader';
import { DailySoftnessCard } from '@/components/DailySoftnessCard';
import { ConnectionTile } from '@/components/ConnectionTile';
import { AddConnectionTile } from '@/components/AddConnectionTile';
import { QuiltGrid } from '@/components/ui';
import { Heading, Body, Caption } from '@/components/ui';
import { getTileVariant, getTileSize } from '@/utils/tileVariant';
import { getDailyQuote } from '@/constants/quotes';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
```

**Step 2: Verify imports work (no runtime errors)**

Run: `npm start` and check for import errors in terminal

**Step 3: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "refactor: update home screen imports for redesign"
```

---

### Task 13: Refactor Home Screen - Part 2 (Remove Old ContactCard)

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Remove the ContactCard component and its related types**

Delete the following from the file (approximately lines 38-194):
- `type ContactCardProps`
- The entire `ContactCard` component function

Keep: `DAY_IN_MS` constant if used elsewhere, otherwise remove it too.

**Step 2: Verify file still compiles**

Run: `npm start` - should show errors about missing ContactCard usage (this is expected, we'll fix in next task)

**Step 3: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "refactor: remove old ContactCard component from home screen"
```

---

### Task 14: Refactor Home Screen - Part 3 (New Layout Structure)

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Replace the HomeScreen component body**

Replace the entire `HomeScreen` function with:

```tsx
export default function HomeScreen() {
  const router = useRouter();
  const [groupedContacts, setGroupedContacts] = useState<GroupedDueContacts>({ birthdays: [], reconnect: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [totalContactCount, setTotalContactCount] = useState<number | null>(null);

  const dailyQuote = useMemo(() => getDailyQuote(), []);

  const loadContacts = useCallback(() => {
    try {
      const results = getDueContactsGrouped();
      setGroupedContacts(results);
      setTotalContactCount(getContactCount());
    } catch (e) {
      console.warn('Failed to load contacts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadContacts();
    }, [loadContacts]),
  );

  // Flatten and sort contacts for quilt grid
  const displayContacts = useMemo(() => {
    const all = [...groupedContacts.birthdays, ...groupedContacts.reconnect];

    // Sort: birthdays first, then by relationship priority
    const relationshipPriority: Record<string, number> = {
      partner: 1,
      spouse: 1,
      family: 2,
      friend: 3,
    };

    return all.sort((a, b) => {
      const aIsBirthday = isBirthdayToday(a);
      const bIsBirthday = isBirthdayToday(b);

      if (aIsBirthday && !bIsBirthday) return -1;
      if (!aIsBirthday && bIsBirthday) return 1;

      const aPriority = relationshipPriority[a.relationship?.toLowerCase() || ''] || 99;
      const bPriority = relationshipPriority[b.relationship?.toLowerCase() || ''] || 99;

      return aPriority - bPriority;
    }).slice(0, 6); // Limit to 6 tiles
  }, [groupedContacts]);

  const handleContactPress = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setShowReachedOutSheet(true);
  }, []);

  const handleReachedOutSubmit = useCallback(async (type: any, note: string) => {
    if (!selectedContact) return;

    try {
      await updateInteraction(selectedContact.id, type, note || undefined);
      setCompletionCount(prev => prev + 1);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      loadContacts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setShowReachedOutSheet(false);
      setSelectedContact(null);
    }
  }, [selectedContact, loadContacts]);

  const handleAddConnection = useCallback(() => {
    router.push('/contacts/add');
  }, [router]);

  const handleSeeAll = useCallback(() => {
    router.push('/contacts');
  }, [router]);

  const handleReflect = useCallback(() => {
    // TODO: Implement reflect feature
    Alert.alert('Reflect', dailyQuote);
  }, [dailyQuote]);

  const handleAvatarPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#9DBEBB" />
      </SafeAreaView>
    );
  }

  if (totalContactCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 px-6 pt-6">
          <HomeHeader
            userName="Friend"
            onAvatarPress={handleAvatarPress}
          />
          <EmptyContactsState />
        </View>
      </SafeAreaView>
    );
  }

  const hasContacts = displayContacts.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-32"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="h-3" />

        <HomeHeader
          userName="Friend"
          onAvatarPress={handleAvatarPress}
        />

        <DailySoftnessCard
          quote={dailyQuote}
          onReflectPress={handleReflect}
        />

        {/* Connections Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-end mb-4">
            <View>
              <Heading size={2}>Your connections</Heading>
              <Caption muted>Nurturing your inner circle</Caption>
            </View>
            {hasContacts && (
              <Body
                size="sm"
                className="text-primary"
                onPress={handleSeeAll}
              >
                See all
              </Body>
            )}
          </View>

          {hasContacts ? (
            <QuiltGrid>
              {displayContacts.map((contact) => {
                const isBirthday = isBirthdayToday(contact);
                return (
                  <ConnectionTile
                    key={contact.id}
                    contact={contact}
                    variant={getTileVariant(contact, isBirthday)}
                    size={getTileSize(contact)}
                    isBirthday={isBirthday}
                    onPress={() => handleContactPress(contact)}
                  />
                );
              })}
              <AddConnectionTile onPress={handleAddConnection} />
            </QuiltGrid>
          ) : (
            <CelebrationStatus completionCount={completionCount} />
          )}
        </View>

        {completionCount > 0 && (
          <Body muted className="text-center mt-6">
            {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today
          </Body>
        )}
      </ScrollView>

      <ReachedOutSheet
        visible={showReachedOutSheet}
        contact={selectedContact}
        onClose={() => {
          setShowReachedOutSheet(false);
          setSelectedContact(null);
        }}
        onSubmit={handleReachedOutSubmit}
      />
    </SafeAreaView>
  );
}
```

**Step 2: Run the app to verify it works**

Run: `npm start` then test on simulator/device
Expected: Home screen renders with new layout

**Step 3: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "refactor: implement new home screen layout with quilt grid"
```

---

### Task 15: Update QuiltGrid for Proper Grid Layout

**Files:**
- Modify: `components/ui/QuiltGrid.tsx`

**Step 1: Check current QuiltGrid implementation**

Read the file and update if needed to support proper 2-column grid with large tiles spanning 2 rows.

**Step 2: Update QuiltGrid if needed**

```tsx
import React from 'react';
import { View } from 'react-native';

type QuiltGridProps = {
  className?: string;
  children: React.ReactNode;
};

export function QuiltGrid({ className = '', children }: QuiltGridProps) {
  return (
    <View className={`flex-row flex-wrap gap-3 ${className}`}>
      {React.Children.map(children, (child, index) => {
        // Check if child has size="large" prop
        const isLarge = React.isValidElement(child) && child.props.size === 'large';

        return (
          <View
            className={isLarge ? 'w-[48%] min-h-[200px]' : 'w-[48%] min-h-[120px]'}
            key={index}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
}
```

**Step 3: Run the app to verify grid layout**

Run: `npm start` and verify tiles display in 2-column grid

**Step 4: Commit**

```bash
git add components/ui/QuiltGrid.tsx
git commit -m "fix: update QuiltGrid for proper 2-column layout with large tile support"
```

---

### Task 16: Final Verification and Cleanup

**Files:**
- Check all test files pass

**Step 1: Run all tests**

Run: `npm test -- --watchAll=false`
Expected: All tests pass

**Step 2: Run linter**

Run: `npm run lint`
Expected: No errors

**Step 3: Manual testing checklist**

- [ ] App loads without errors
- [ ] Home header shows greeting and Kindred title
- [ ] Daily Softness card displays quote
- [ ] Quilt grid shows connection tiles
- [ ] Tiles have correct colors based on relationship
- [ ] Partner/Spouse tiles are larger
- [ ] Birthday contacts show 🎂 emoji
- [ ] Tapping tile opens Reached Out sheet
- [ ] Pull-to-refresh works
- [ ] Empty state works when no contacts
- [ ] Add connection tile navigates correctly
- [ ] See all navigates to contacts list

**Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final cleanup and verification for home screen redesign"
```

---

## Summary

**Total Tasks:** 16
**New Files Created:** 11
- `components/HomeHeader.tsx`
- `components/HomeHeader.test.tsx`
- `components/DailySoftnessCard.tsx`
- `components/DailySoftnessCard.test.tsx`
- `components/ConnectionTile.tsx`
- `components/ConnectionTile.test.tsx`
- `components/AddConnectionTile.tsx`
- `components/AddConnectionTile.test.tsx`
- `utils/tileVariant.ts`
- `utils/tileVariant.test.ts`
- `constants/quotes.ts`

**Modified Files:** 3
- `components/index.ts` (or created)
- `components/ui/QuiltGrid.tsx`
- `app/(tabs)/index.tsx`

**Deleted Code:**
- `ContactCard` component (from index.tsx)
- Old SectionList implementation
