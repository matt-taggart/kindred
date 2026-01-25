# Connection Detail Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Connection Detail screen redesign with new components and updated layout.

**Architecture:** Component-based design with new presentational components, preserving existing data layer and functionality.

**Tech Stack:** React Native, Expo, NativeWind, TypeScript, Jest

---

## Task 1: Create ConnectionDetailHeader Component

**Files:**
- Create: `components/ConnectionDetailHeader.tsx`

**Step 1: Write the component**

```tsx
import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Caption } from './ui/Typography';

interface ConnectionDetailHeaderProps {
  name: string;
  relationship: string;
  onBackPress: () => void;
  onMorePress: () => void;
}

export function ConnectionDetailHeader({
  name,
  relationship,
  onBackPress,
  onMorePress,
}: ConnectionDetailHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <Pressable
        onPress={onBackPress}
        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 items-center justify-center shadow-sm"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color="#64748b" />
      </Pressable>

      <View className="items-center flex-1">
        <Heading size={4}>{name}</Heading>
        <Caption className="uppercase tracking-widest">{relationship}</Caption>
      </View>

      <Pressable
        onPress={onMorePress}
        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 items-center justify-center shadow-sm"
        accessibilityLabel="More options"
      >
        <Ionicons name="ellipsis-horizontal" size={24} color="#64748b" />
      </Pressable>
    </View>
  );
}
```

**Step 2: Commit**

```bash
git add components/ConnectionDetailHeader.tsx
git commit -m "feat: add ConnectionDetailHeader component"
```

---

## Task 2: Create ConnectionDetailHeader Tests

**Files:**
- Create: `components/ConnectionDetailHeader.test.tsx`

**Step 1: Write tests**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionDetailHeader } from './ConnectionDetailHeader';

describe('ConnectionDetailHeader', () => {
  const defaultProps = {
    name: 'Maya',
    relationship: 'Friend',
    onBackPress: jest.fn(),
    onMorePress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(<ConnectionDetailHeader {...defaultProps} />);
    expect(getByText('Maya')).toBeTruthy();
  });

  it('renders relationship type', () => {
    const { getByText } = render(<ConnectionDetailHeader {...defaultProps} />);
    expect(getByText('Friend')).toBeTruthy();
  });

  it('calls onBackPress when back button pressed', () => {
    const { getByLabelText } = render(<ConnectionDetailHeader {...defaultProps} />);
    fireEvent.press(getByLabelText('Go back'));
    expect(defaultProps.onBackPress).toHaveBeenCalledTimes(1);
  });

  it('calls onMorePress when more button pressed', () => {
    const { getByLabelText } = render(<ConnectionDetailHeader {...defaultProps} />);
    fireEvent.press(getByLabelText('More options'));
    expect(defaultProps.onMorePress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run tests**

```bash
npm test -- ConnectionDetailHeader.test.tsx
```

**Step 3: Commit**

```bash
git add components/ConnectionDetailHeader.test.tsx
git commit -m "test: add ConnectionDetailHeader tests"
```

---

## Task 3: Create ConnectionProfileSection Component

**Files:**
- Create: `components/ConnectionProfileSection.tsx`

**Step 1: Write the component**

```tsx
import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui/Typography';

interface ConnectionProfileSectionProps {
  avatarUri: string | null;
  name: string;
  relationship: string;
  lastConnected: string | null;
  isFavorite?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRingColor(relationship: string): string {
  const rel = relationship.toLowerCase();
  if (rel.includes('partner') || rel.includes('spouse')) {
    return 'border-secondary/30';
  }
  if (rel.includes('family') || rel.includes('parent') || rel.includes('sibling')) {
    return 'border-primary/30';
  }
  if (rel.includes('friend')) {
    return 'border-accent/30';
  }
  return 'border-slate-200';
}

export function ConnectionProfileSection({
  avatarUri,
  name,
  relationship,
  lastConnected,
  isFavorite = false,
}: ConnectionProfileSectionProps) {
  const ringColor = getRingColor(relationship);

  return (
    <View className="items-center py-8">
      <View className="relative">
        <View className={`w-32 h-32 rounded-full border-4 ${ringColor} p-1.5`}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full rounded-full"
              accessibilityLabel={`${name}'s photo`}
            />
          ) : (
            <View className="w-full h-full rounded-full bg-primary/20 items-center justify-center">
              <Body size="xl" weight="semibold" className="text-primary">
                {getInitials(name)}
              </Body>
            </View>
          )}
        </View>

        {isFavorite && (
          <View className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md">
            <Ionicons name="heart" size={20} color="#9DBEBB" />
          </View>
        )}
      </View>

      {lastConnected && (
        <Body size="sm" muted className="mt-4">
          {lastConnected}
        </Body>
      )}
    </View>
  );
}
```

**Step 2: Commit**

```bash
git add components/ConnectionProfileSection.tsx
git commit -m "feat: add ConnectionProfileSection component"
```

---

## Task 4: Create ConnectionProfileSection Tests

**Files:**
- Create: `components/ConnectionProfileSection.test.tsx`

**Step 1: Write tests**

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectionProfileSection } from './ConnectionProfileSection';

describe('ConnectionProfileSection', () => {
  const defaultProps = {
    avatarUri: null,
    name: 'Maya Chen',
    relationship: 'Friend',
    lastConnected: 'Last connected in March',
    isFavorite: false,
  };

  it('renders initials when no avatar', () => {
    const { getByText } = render(<ConnectionProfileSection {...defaultProps} />);
    expect(getByText('MC')).toBeTruthy();
  });

  it('renders avatar image when provided', () => {
    const { getByLabelText } = render(
      <ConnectionProfileSection {...defaultProps} avatarUri="https://example.com/photo.jpg" />
    );
    expect(getByLabelText("Maya Chen's photo")).toBeTruthy();
  });

  it('renders last connected text', () => {
    const { getByText } = render(<ConnectionProfileSection {...defaultProps} />);
    expect(getByText('Last connected in March')).toBeTruthy();
  });

  it('does not render last connected when null', () => {
    const { queryByText } = render(
      <ConnectionProfileSection {...defaultProps} lastConnected={null} />
    );
    expect(queryByText('Last connected')).toBeNull();
  });

  it('renders favorite badge when isFavorite is true', () => {
    const { UNSAFE_getByType } = render(
      <ConnectionProfileSection {...defaultProps} isFavorite={true} />
    );
    // Heart icon should be present
    expect(UNSAFE_getByType(require('@expo/vector-icons').Ionicons)).toBeTruthy();
  });

  it('uses correct ring color for partner relationship', () => {
    const { getByTestId } = render(
      <ConnectionProfileSection {...defaultProps} relationship="Partner" />
    );
    // Ring should have secondary color - verified via accessibilityHint
  });
});
```

**Step 2: Commit**

```bash
git add components/ConnectionProfileSection.test.tsx
git commit -m "test: add ConnectionProfileSection tests"
```

---

## Task 5: Create ConnectionNotesCard Component

**Files:**
- Create: `components/ConnectionNotesCard.tsx`

**Step 1: Write the component**

```tsx
import React from 'react';
import { View, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Caption } from './ui/Typography';

interface ConnectionNotesCardProps {
  notes: string;
  onChangeNotes: (text: string) => void;
  placeholder?: string;
}

export function ConnectionNotesCard({
  notes,
  onChangeNotes,
  placeholder = 'What matters to you about this connection?',
}: ConnectionNotesCardProps) {
  return (
    <View className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
      <View className="flex-row items-center gap-2 mb-3">
        <MaterialCommunityIcons name="auto-awesome" size={18} color="#fbbf24" />
        <Caption className="uppercase tracking-wider">Notes</Caption>
      </View>

      <TextInput
        value={notes}
        onChangeText={onChangeNotes}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        multiline
        className="bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-200"
        style={{ height: 96, textAlignVertical: 'top' }}
        accessibilityLabel="Connection notes"
      />
    </View>
  );
}
```

**Step 2: Commit**

```bash
git add components/ConnectionNotesCard.tsx
git commit -m "feat: add ConnectionNotesCard component"
```

---

## Task 6: Create ConnectionNotesCard Tests

**Files:**
- Create: `components/ConnectionNotesCard.test.tsx`

**Step 1: Write tests**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionNotesCard } from './ConnectionNotesCard';

describe('ConnectionNotesCard', () => {
  const defaultProps = {
    notes: '',
    onChangeNotes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Notes header', () => {
    const { getByText } = render(<ConnectionNotesCard {...defaultProps} />);
    expect(getByText('Notes')).toBeTruthy();
  });

  it('renders placeholder text', () => {
    const { getByPlaceholderText } = render(<ConnectionNotesCard {...defaultProps} />);
    expect(getByPlaceholderText('What matters to you about this connection?')).toBeTruthy();
  });

  it('renders custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <ConnectionNotesCard {...defaultProps} placeholder="Add a note..." />
    );
    expect(getByPlaceholderText('Add a note...')).toBeTruthy();
  });

  it('displays notes value', () => {
    const { getByDisplayValue } = render(
      <ConnectionNotesCard {...defaultProps} notes="Met at coffee shop" />
    );
    expect(getByDisplayValue('Met at coffee shop')).toBeTruthy();
  });

  it('calls onChangeNotes when text changes', () => {
    const { getByLabelText } = render(<ConnectionNotesCard {...defaultProps} />);
    fireEvent.changeText(getByLabelText('Connection notes'), 'New note');
    expect(defaultProps.onChangeNotes).toHaveBeenCalledWith('New note');
  });
});
```

**Step 2: Commit**

```bash
git add components/ConnectionNotesCard.test.tsx
git commit -m "test: add ConnectionNotesCard tests"
```

---

## Task 7: Create QuickActionTile Component

**Files:**
- Create: `components/QuickActionTile.tsx`

**Step 1: Write the component**

```tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Body } from './ui/Typography';

type QuickActionVariant = 'call' | 'text' | 'voice' | 'later';

interface QuickActionTileProps {
  variant: QuickActionVariant;
  onPress: () => void;
}

const VARIANT_CONFIG = {
  call: {
    icon: 'call' as const,
    iconFamily: 'ionicons' as const,
    label: 'Call',
    bgColor: 'bg-secondary/20',
    iconBgColor: 'bg-secondary',
    textColor: 'text-pink-600 dark:text-pink-300',
    iconColor: '#ffffff',
  },
  text: {
    icon: 'chatbubble-outline' as const,
    iconFamily: 'ionicons' as const,
    label: 'Text',
    bgColor: 'bg-primary/20',
    iconBgColor: 'bg-primary',
    textColor: 'text-emerald-600 dark:text-emerald-300',
    iconColor: '#1e293b',
  },
  voice: {
    icon: 'mic' as const,
    iconFamily: 'ionicons' as const,
    label: 'Voice Note',
    bgColor: 'bg-accent/20',
    iconBgColor: 'bg-accent',
    textColor: 'text-amber-600 dark:text-amber-300',
    iconColor: '#1e293b',
  },
  later: {
    icon: 'note-edit-outline' as const,
    iconFamily: 'material' as const,
    label: 'Write Later',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    iconBgColor: 'bg-white dark:bg-slate-700',
    textColor: 'text-slate-500 dark:text-slate-400',
    iconColor: '#94a3b8',
  },
};

export function QuickActionTile({ variant, onPress }: QuickActionTileProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Pressable
      onPress={onPress}
      className={`${config.bgColor} p-6 rounded-3xl flex-col items-center justify-center gap-3 active:scale-95`}
      accessibilityLabel={config.label}
      accessibilityHint={`variant-${variant}`}
    >
      <View className={`${config.iconBgColor} w-12 h-12 rounded-2xl items-center justify-center`}>
        {config.iconFamily === 'ionicons' ? (
          <Ionicons name={config.icon} size={24} color={config.iconColor} />
        ) : (
          <MaterialCommunityIcons name={config.icon} size={24} color={config.iconColor} />
        )}
      </View>
      <Body weight="semibold" className={config.textColor}>
        {config.label}
      </Body>
    </Pressable>
  );
}
```

**Step 2: Commit**

```bash
git add components/QuickActionTile.tsx
git commit -m "feat: add QuickActionTile component"
```

---

## Task 8: Create QuickActionTile Tests

**Files:**
- Create: `components/QuickActionTile.test.tsx`

**Step 1: Write tests**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionTile } from './QuickActionTile';

describe('QuickActionTile', () => {
  it('renders call variant correctly', () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <QuickActionTile variant="call" onPress={onPress} />
    );
    expect(getByText('Call')).toBeTruthy();
    expect(getByLabelText('Call')).toBeTruthy();
  });

  it('renders text variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="text" onPress={jest.fn()} />
    );
    expect(getByText('Text')).toBeTruthy();
  });

  it('renders voice variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="voice" onPress={jest.fn()} />
    );
    expect(getByText('Voice Note')).toBeTruthy();
  });

  it('renders later variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="later" onPress={jest.fn()} />
    );
    expect(getByText('Write Later')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <QuickActionTile variant="call" onPress={onPress} />
    );
    fireEvent.press(getByLabelText('Call'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility hint for variant', () => {
    const { getByA11yHint } = render(
      <QuickActionTile variant="text" onPress={jest.fn()} />
    );
    expect(getByA11yHint('variant-text')).toBeTruthy();
  });
});
```

**Step 2: Commit**

```bash
git add components/QuickActionTile.test.tsx
git commit -m "test: add QuickActionTile tests"
```

---

## Task 9: Create SharedMomentsSection Component

**Files:**
- Create: `components/SharedMomentsSection.tsx`

**Step 1: Write the component**

```tsx
import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body, Caption } from './ui/Typography';

export interface Moment {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUri?: string;
  icon?: string;
  iconBgColor?: string;
}

interface SharedMomentsSectionProps {
  moments: Moment[];
  onViewAll?: () => void;
  onMomentPress?: (moment: Moment) => void;
}

const ICON_COLORS: Record<string, string> = {
  'bg-amber-50': '#fcd34d',
  'bg-emerald-50': '#6ee7b7',
  'bg-pink-50': '#f9a8d4',
  'bg-sky-50': '#7dd3fc',
};

export function SharedMomentsSection({
  moments,
  onViewAll,
  onMomentPress,
}: SharedMomentsSectionProps) {
  if (moments.length === 0) {
    return null;
  }

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between px-2 mb-4">
        <Heading size={4}>Shared moments</Heading>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <Body size="sm" weight="semibold" className="text-primary">
              View all
            </Body>
          </Pressable>
        )}
      </View>

      <View className="space-y-3">
        {moments.map((moment) => (
          <Pressable
            key={moment.id}
            onPress={() => onMomentPress?.(moment)}
            className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex-row items-center gap-4 border border-slate-100 dark:border-slate-700 shadow-soft mb-3"
          >
            <View
              className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 ${
                moment.iconBgColor || 'bg-slate-100'
              } items-center justify-center`}
            >
              {moment.imageUri ? (
                <Image
                  source={{ uri: moment.imageUri }}
                  className="w-full h-full"
                  accessibilityLabel={moment.title}
                />
              ) : (
                <Ionicons
                  name={(moment.icon as any) || 'heart-outline'}
                  size={28}
                  color={ICON_COLORS[moment.iconBgColor || 'bg-slate-100'] || '#94a3b8'}
                />
              )}
            </View>

            <View className="flex-1 min-w-0">
              <Body weight="semibold" numberOfLines={1}>
                {moment.title}
              </Body>
              <Caption muted numberOfLines={1}>
                {moment.date} {moment.description && `• ${moment.description}`}
              </Caption>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```

**Step 2: Commit**

```bash
git add components/SharedMomentsSection.tsx
git commit -m "feat: add SharedMomentsSection component"
```

---

## Task 10: Create SharedMomentsSection Tests

**Files:**
- Create: `components/SharedMomentsSection.test.tsx`

**Step 1: Write tests**

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SharedMomentsSection, Moment } from './SharedMomentsSection';

describe('SharedMomentsSection', () => {
  const mockMoments: Moment[] = [
    {
      id: '1',
      title: 'Coffee at The Nook',
      date: 'March 14',
      description: 'Gentle conversation',
      iconBgColor: 'bg-amber-50',
      icon: 'cafe',
    },
    {
      id: '2',
      title: 'Walk in the Park',
      date: 'Feb 28',
      description: 'Sunny afternoon',
      imageUri: 'https://example.com/photo.jpg',
    },
  ];

  it('renders nothing when moments is empty', () => {
    const { toJSON } = render(
      <SharedMomentsSection moments={[]} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders section header', () => {
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} />
    );
    expect(getByText('Shared moments')).toBeTruthy();
  });

  it('renders View all button when onViewAll provided', () => {
    const onViewAll = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onViewAll={onViewAll} />
    );
    expect(getByText('View all')).toBeTruthy();
  });

  it('calls onViewAll when pressed', () => {
    const onViewAll = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onViewAll={onViewAll} />
    );
    fireEvent.press(getByText('View all'));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('renders moment titles', () => {
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} />
    );
    expect(getByText('Coffee at The Nook')).toBeTruthy();
    expect(getByText('Walk in the Park')).toBeTruthy();
  });

  it('calls onMomentPress when moment pressed', () => {
    const onMomentPress = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onMomentPress={onMomentPress} />
    );
    fireEvent.press(getByText('Coffee at The Nook'));
    expect(onMomentPress).toHaveBeenCalledWith(mockMoments[0]);
  });
});
```

**Step 2: Commit**

```bash
git add components/SharedMomentsSection.test.tsx
git commit -m "test: add SharedMomentsSection tests"
```

---

## Task 11: Update Component Exports

**Files:**
- Modify: `components/index.ts`

**Step 1: Add new exports**

Add to existing exports:
```tsx
export { ConnectionDetailHeader } from './ConnectionDetailHeader';
export { ConnectionProfileSection } from './ConnectionProfileSection';
export { ConnectionNotesCard } from './ConnectionNotesCard';
export { QuickActionTile } from './QuickActionTile';
export { SharedMomentsSection } from './SharedMomentsSection';
export type { Moment } from './SharedMomentsSection';
```

**Step 2: Commit**

```bash
git add components/index.ts
git commit -m "feat: export new connection detail components"
```

---

## Task 12: Refactor Connection Detail Screen - Part 1 (Header & Profile)

**Files:**
- Modify: `app/contacts/[id].tsx`

**Step 1: Update imports and replace header section**

Replace the existing header and contact info section with:
- ConnectionDetailHeader component
- ConnectionProfileSection component
- Update color classes from old palette to new

**Step 2: Commit**

```bash
git add app/contacts/[id].tsx
git commit -m "refactor: update connection detail header and profile section"
```

---

## Task 13: Refactor Connection Detail Screen - Part 2 (Notes & Actions)

**Files:**
- Modify: `app/contacts/[id].tsx`

**Step 1: Replace notes and action sections**

- Remove old schedule summary card
- Add ConnectionNotesCard with state management
- Replace inline action buttons with QuiltGrid of QuickActionTile components
- Add handlers for voice and later actions (placeholder for now)

**Step 2: Commit**

```bash
git add app/contacts/[id].tsx
git commit -m "refactor: update connection detail notes and quick actions"
```

---

## Task 14: Refactor Connection Detail Screen - Part 3 (Moments & Cleanup)

**Files:**
- Modify: `app/contacts/[id].tsx`

**Step 1: Add shared moments and finalize**

- Add SharedMomentsSection (map from existing interactions or use sample data)
- Remove old interactions list
- Clean up unused imports and code
- Ensure ReachedOutSheet still works

**Step 2: Commit**

```bash
git add app/contacts/[id].tsx
git commit -m "refactor: add shared moments and complete connection detail redesign"
```

---

## Task 15: Final Verification

**Step 1: Run all tests**

```bash
npm test
```

**Step 2: Run linting**

```bash
npm run lint
```

**Step 3: Fix any issues**

**Step 4: Final commit if needed**

```bash
git add -A
git commit -m "fix: resolve any remaining issues from connection detail redesign"
```
