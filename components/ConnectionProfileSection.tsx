import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Heading } from './ui';
import Colors from '@/constants/Colors';
import { formatBirthdayDisplay } from '@/utils/formatters';
import { normalizeAvatarUri } from '@/utils/avatar';

interface ConnectionProfileSectionProps {
  avatarUri: string | null;
  name: string;
  relationship: string;
  lastConnected: string | null;
  birthday?: string | null;
  isFavorite?: boolean;
  showRelationshipPill?: boolean;
}

/**
 * Get first initial from the first name token
 */
function getFirstInitial(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  return firstName.charAt(0).toUpperCase();
}

/**
 * Get ring border color class based on relationship type
 */
function getRingColor(relationship: string): string {
  const rel = relationship.toLowerCase();

  if (rel === 'partner' || rel === 'spouse') {
    return 'border-secondary/30';
  }

  if (rel === 'parent' || rel === 'sibling' || rel === 'family') {
    return 'border-primary/30';
  }

  if (rel === 'friend') {
    return 'border-accent-border';
  }

  return 'border-stroke-soft dark:border-slate-800';
}

function getRelationshipPillStyles(relationship: string): {
  icon: keyof typeof Ionicons.glyphMap;
  className: string;
} {
  const rel = relationship.toLowerCase();

  if (rel === 'partner' || rel === 'spouse') {
    return {
      icon: 'heart',
      className: 'bg-secondary/20 border-secondary/30',
    };
  }

  if (rel === 'parent' || rel === 'sibling' || rel === 'family') {
    return {
      icon: 'home-outline',
      className: 'bg-sage-light border-primary/25',
    };
  }

  if (rel === 'friend') {
    return {
      icon: 'leaf-outline',
      className: 'bg-accent-soft border-accent-border',
    };
  }

  return {
    icon: 'person-outline',
    className: 'bg-surface-card border-stroke-soft',
  };
}

export function ConnectionProfileSection({
  avatarUri,
  name,
  relationship,
  lastConnected,
  birthday = null,
  isFavorite = false,
  showRelationshipPill = true,
}: ConnectionProfileSectionProps) {
  const ringColor = getRingColor(relationship);
  const initial = getFirstInitial(name);
  const birthdayLabel = birthday ? formatBirthdayDisplay(birthday) : null;
  const relationshipPill = getRelationshipPillStyles(relationship);
  const shouldShowRelationshipPill = showRelationshipPill && relationship.trim().length > 0;
  const normalizedAvatarUri = normalizeAvatarUri(avatarUri);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const showAvatarImage = Boolean(normalizedAvatarUri) && !avatarLoadFailed;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [normalizedAvatarUri]);

  return (
    <View className="items-center pt-4 pb-6" testID="connection-profile-section">
      <Heading size={2} className="text-text-strong dark:text-slate-100 mb-4 text-center">
        {name}
      </Heading>

      {shouldShowRelationshipPill && (
        <View className={`mb-4 flex-row items-center rounded-full border px-3 py-1.5 ${relationshipPill.className}`}>
          <Ionicons name={relationshipPill.icon} size={14} color={Colors.textSoft} />
          <Body size="sm" className="ml-1.5 text-text-muted dark:text-slate-200">
            {relationship}
          </Body>
        </View>
      )}

      {/* Avatar wrapper with ring */}
      <View className={`w-32 h-32 rounded-full border-[3px] p-1.5 ${ringColor}`}>
        {showAvatarImage ? (
          <Image
            source={{ uri: normalizedAvatarUri }}
            className="w-full h-full rounded-full"
            accessibilityLabel={`${name}'s profile photo`}
            testID="profile-avatar"
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <View
            className="w-full h-full rounded-full bg-sage-light dark:bg-accent-dark-sage items-center justify-center"
            testID="profile-initials"
          >
            <Body className="text-4xl font-semibold tracking-tight text-primary">{initial}</Body>
          </View>
        )}

        {/* Favorite badge */}
        {isFavorite && (
          <View
            className="absolute bottom-1 right-1 bg-surface-card dark:bg-card-dark p-1.5 rounded-full shadow-md border border-stroke-soft dark:border-slate-800"
            testID="favorite-badge"
          >
            <Ionicons name="heart" size={16} color={Colors.primary} />
          </View>
        )}
      </View>

      {/* Last connected text */}
      {lastConnected && (
        <Body size="sm" muted className="mt-4" testID="last-connected-text">
          {lastConnected}
        </Body>
      )}

      {birthdayLabel && (
        <View
          className="mt-3 flex-row items-center rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 dark:border-accent-warm/60 dark:bg-accent-warm/15"
          testID="birthday-pill"
        >
          <Ionicons name="gift-outline" size={14} color={Colors.primary} />
          <Body size="sm" className="ml-1.5 text-text-soft dark:text-slate-100">
            {birthdayLabel}
          </Body>
        </View>
      )}
    </View>
  );
}
