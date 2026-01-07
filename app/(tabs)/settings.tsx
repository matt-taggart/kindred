import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useUserStore } from '@/lib/userStore';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
};

function SettingsRow({ icon, label, onPress, showChevron = true, rightElement }: SettingsRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between bg-white px-4 py-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={22} color="#475569" />
        <Text className="text-base text-gray-900">{label}</Text>
      </View>
      {rightElement ?? (showChevron && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />)}
    </TouchableOpacity>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-2 px-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-gray-100">{children}</View>
    </View>
  );
}

function Divider() {
  return <View className="ml-12 h-px bg-gray-100" />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPro, restorePurchase, purchaseState } = useUserStore();

  const handleNotifications = () => {
    router.push('/settings/notifications');
  };

  const handleUpgrade = () => {
    router.push('/modal?paywall=1');
  };

  const handleRestorePurchase = async () => {
    await restorePurchase();
    if (useUserStore.getState().isPro) {
      Alert.alert('Success', 'Your purchase has been restored.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Settings</Text>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={handleNotifications}
          />
        </SettingsSection>

        <SettingsSection title="About">
          {!isPro && (
            <>
              <SettingsRow
                icon="sparkles-outline"
                label="Upgrade to Pro"
                onPress={handleUpgrade}
              />
              <Divider />
            </>
          )}
          <SettingsRow
            icon="refresh-outline"
            label="Restore Purchases"
            onPress={handleRestorePurchase}
            showChevron={false}
            rightElement={
              purchaseState.isRestoring ? (
                <Text className="text-sm text-gray-500">Restoring...</Text>
              ) : null
            }
          />
          {isPro && (
            <>
              <Divider />
              <View className="flex-row items-center justify-between bg-white px-4 py-4">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={22} color="#9CA986" />
                  <Text className="text-base text-gray-900">Kindred Pro</Text>
                </View>
                <Text className="text-sm font-medium text-sage">Active</Text>
              </View>
            </>
          )}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
