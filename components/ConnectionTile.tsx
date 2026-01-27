import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Caption, Body } from './ui';
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
    iconColor: '#F97316',
    badgeColor: 'text-orange-400/70',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-white dark:bg-slate-700',
    iconColor: '#9ca3af',
    badgeColor: 'text-slate-400',
  },
};

const relationshipIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  partner: 'heart',
  spouse: 'heart',
  family: 'home',
  friend: 'leaf',
  mentor: 'school',
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

  // Build className with variant and size markers for test assertions
  const classNames = [
    styles.bg,
    styles.border,
    'border',
    'p-5',
    'rounded-3xl',
    'flex-col',
    'justify-between',
    'min-h-[160px]',
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
