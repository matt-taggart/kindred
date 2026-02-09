import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Heading } from './ui';
import Colors from '@/constants/Colors';

interface ConnectionProfileSectionProps {
  avatarUri: string | null;
  name: string;
  relationship: string;
  lastConnected: string | null;
  isFavorite?: boolean;
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
  const initial = getFirstInitial(name);

  return (
    <View className="items-center pt-4 pb-6" testID="connection-profile-section">
      <Heading size={2} className="text-brand-navy dark:text-slate-100 mb-4 text-center">
        {name}
      </Heading>

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
            <Body className="text-4xl font-semibold tracking-tight text-primary">{initial}</Body>
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
