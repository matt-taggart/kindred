import React from 'react';
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
  onAvatarPress,
}: HomeHeaderProps) {
  const greeting = getGreeting();

  return (
    <View className="flex-row justify-between items-center mb-8">
      <View>
        <Body size="sm" muted>
          {greeting}, {userName}
        </Body>
        <View className="flex-row items-center mt-1">
          <Image 
            source={require('../assets/images/logo-in-app.png')} 
            style={{ width: 24, height: 24, marginRight: 8 }} 
            resizeMode="contain"
          />
          <Heading size={1}>
            Kindred
          </Heading>
        </View>
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
