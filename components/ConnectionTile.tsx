import React from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body } from './ui';
import Colors from '@/constants/Colors';

// Extended Contact type for ConnectionTile (supports additional fields from test)
type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
  birthday: string | null;
  frequency?: number;
  relationship?: string | null;
  lastContactedAt: number | null;
  nextContactAt?: number | null;
  nextContactDate?: number | null;
  snoozedUntil?: number | null;
  avatarUri: string | null;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
  bucket?: string;
  customIntervalDays?: number | null;
  isArchived?: boolean;
};

type ConnectionTileProps = {
  contact: Contact;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'standard' | 'large';
  isBirthday?: boolean;
  onPress: () => void;
  onOpenActions?: () => void;
};

const variantStyles = {
  primary: {
    bg: 'bg-primary/15 dark:bg-primary/20',
    border: 'border-primary/25 dark:border-primary/30',
    iconBg: 'bg-primary/30 dark:bg-primary/30',
    iconColor: Colors.primary,
  },
  secondary: {
    bg: 'bg-secondary/15 dark:bg-secondary/20',
    border: 'border-secondary/25 dark:border-secondary/30',
    iconBg: 'bg-secondary/30 dark:bg-secondary/30',
    iconColor: Colors.secondary,
  },
  accent: {
    bg: 'bg-accent/40 dark:bg-accent/15',
    border: 'border-accent/60 dark:border-accent/25',
    iconBg: 'bg-accent/80 dark:bg-accent/25',
    iconColor: '#d97706',
  },
};

const relationshipIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  partner: 'heart',
  spouse: 'heart',
  family: 'home',
  friend: 'leaf',
  colleague: 'briefcase',
  other: 'person',
};

function getRelationshipIcon(relationship: string | null | undefined): keyof typeof Ionicons.glyphMap {
  if (!relationship) return 'person';
  return relationshipIcons[relationship.toLowerCase()] || 'person';
}

function getStatusText(contact: Contact, isBirthday?: boolean): string {
  if (isBirthday) {
    return `It's ${contact.name}'s birthday!`;
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
  variant = 'primary',
  size = 'standard',
  isBirthday = false,
  onPress,
  onOpenActions,
}: ConnectionTileProps) {
  const styles = variantStyles[variant];
  const iconName = getRelationshipIcon(contact.relationship);
  const statusText = getStatusText(contact, isBirthday);

  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-8 h-8';
  const iconContainerSize = size === 'large' ? 'rounded-2xl' : 'rounded-xl';
  const nameSize = size === 'large' ? 2 : 3;

  // Build className with variant and size markers for test assertions
  const classNames = [
    styles.bg,
    styles.border,
    'border',
    size === 'large' ? 'p-5' : 'px-4 py-4',
    'rounded-3xl',
    'flex-col',
    'min-h-[140px]',
    'shadow-soft',
  ];

  if (size === 'large') {
    classNames.push('large');
  }
  if (variant === 'primary') {
    classNames.push('primary');
  }
  if (variant === 'secondary') {
    classNames.push('secondary');
  }

  // Build accessibility hint for testing (NativeWind converts className to style)
  const accessibilityHintParts: string[] = [variant];
  if (size === 'large') {
    accessibilityHintParts.push('large');
  }

  return (
    <TouchableOpacity
      testID="connection-tile"
      onPress={onPress}
      activeOpacity={0.7}
      className={classNames.join(' ')}
      accessibilityHint={accessibilityHintParts.join(' ')}
    >
      <View className="flex-row justify-between items-start">
        <View
          testID="relationship-icon"
          className={`${iconSize} ${iconContainerSize} ${styles.iconBg} items-center justify-center`}
        >
          <Ionicons
            name={iconName}
            size={size === 'large' ? 20 : 16}
            color={styles.iconColor}
          />
        </View>
        <View>
          {onOpenActions ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onOpenActions();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Open quick actions for ${contact.name}`}
              className="w-7 h-7 rounded-full bg-primary/12 dark:bg-primary/25 items-center justify-center"
            >
              <Ionicons name="ellipsis-horizontal" size={14} color={styles.iconColor} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className={size === 'large' ? 'mt-4' : 'mt-3'}>
        <View className="flex-row items-center gap-1">
          <Heading size={nameSize} className="text-brand-navy dark:text-slate-100">
            {contact.name}
          </Heading>
          {isBirthday && <Body>🎂</Body>}
        </View>
        <Body size="sm" className="mt-1 text-slate-700 dark:text-slate-300">
          {statusText}
        </Body>
      </View>
    </TouchableOpacity>
  );
}
