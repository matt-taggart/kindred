import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui';
import Colors from '@/constants/Colors';

interface ConnectionProfileSectionProps {
  avatarUri: string | null;
  name: string;
  relationship: string;
  lastConnected: string | null;
  isFavorite?: boolean;
}

/**
 * Get initials from a name string
 * Takes first letter of each word, uppercase, max 2 characters
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
    return 'border-accent/30';
  }

  return 'border-slate-200 dark:border-slate-800';
}

export function ConnectionProfileSection({
  avatarUri,
  name,
  relationship,
  lastConnected,
  isFavorite = false,
}: ConnectionProfileSectionProps) {
  const ringColor = getRingColor(relationship);
  const initials = getInitials(name);

  return (
    <View className="items-center pt-4 pb-6" testID="connection-profile-section">
      {/* Avatar wrapper with ring */}
      <View className={`w-32 h-32 rounded-full border-[3px] p-1.5 ${ringColor}`}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="w-full h-full rounded-full"
            accessibilityLabel={`${name}'s profile photo`}
            testID="profile-avatar"
          />
        ) : (
          <View
            className="w-full h-full rounded-full bg-sage-light dark:bg-accent-dark-sage items-center justify-center"
            testID="profile-initials"
          >
            <Body className="text-4xl font-semibold tracking-tight text-primary">{initials}</Body>
          </View>
        )}

        {/* Favorite badge */}
        {isFavorite && (
          <View
            className="absolute bottom-1 right-1 bg-white dark:bg-card-dark p-1.5 rounded-full shadow-md border border-slate-100 dark:border-slate-800"
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
    </View>
  );
}
