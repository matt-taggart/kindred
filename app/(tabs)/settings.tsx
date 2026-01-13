import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';

import { useUserStore } from '@/lib/userStore';
import { resetDatabase } from '@/services/contactService';
import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';

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
      className="flex-row items-center justify-between bg-surface px-4 py-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={22} color="#5C6356" />
        <Text className="text-base text-warmgray">{label}</Text>
      </View>
      {rightElement ?? (showChevron && <Ionicons name="chevron-forward" size={20} color="#8B9678" />)}
    </TouchableOpacity>
  );
}

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-1 px-4 text-sm font-semibold uppercase tracking-wide text-warmgray-muted">
        {title}
      </Text>
      {description && (
        <Text className="mb-2 px-4 text-sm text-warmgray-muted">{description}</Text>
      )}
      <View className="overflow-hidden rounded-2xl border border-border">{children}</View>
    </View>
  );
}

function Divider() {
  return <View className="ml-12 h-px bg-border" />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPro, restorePurchase, purchaseState } = useUserStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotifications = () => {
    router.push('/settings/notifications');
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handleRestorePurchase = async () => {
    await restorePurchase();
    if (useUserStore.getState().isPro) {
      Alert.alert('Success', 'Your purchase has been restored.');
    }
  };

  const handleDeleteAllData = () => {
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const resetProStatus = __DEV__
    ? () => {
        Alert.alert(
          'Reset Pro Status',
          'Are you sure you want to reset your Pro status? This will make the app behave as if you never upgraded.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => {
                useUserStore.getState().setIsPro(false);
                Alert.alert('Done', 'Pro status has been reset.');
              },
            },
          ],
        );
      }
    : undefined;

  const confirmDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      await resetDatabase();
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      Alert.alert('Done', 'All your data has been deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mb-6 text-2xl font-bold text-warmgray">Settings</Text>

        <SettingsSection title="Reminders" description="Choose when Kindred gently nudges you">
          <SettingsRow
            icon="notifications-outline"
            label="Reminder Schedule"
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
                <Text className="text-sm text-warmgray-muted">Restoring...</Text>
              ) : null
            }
          />
          {isPro && (
            <>
              <Divider />
              <View className="flex-row items-center justify-between bg-surface px-4 py-4">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={22} color="#9CA986" />
                  <Text className="text-base text-warmgray">Kindred Pro</Text>
                </View>
                <Text className="text-sm font-medium text-sage">Active</Text>
              </View>
            </>
          )}
        </SettingsSection>

        <SettingsSection title="Data Management">
          {__DEV__ && resetProStatus && (
            <>
              <SettingsRow
                icon="refresh-circle-outline"
                label="Reset Pro Status"
                onPress={resetProStatus}
              />
              <Divider />
            </>
          )}
          <TouchableOpacity
            className="flex-row items-center justify-between bg-surface px-4 py-4"
            onPress={handleDeleteAllData}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="trash-outline" size={22} color="#D4896A" />
              <Text className="text-base text-terracotta">Delete All Data</Text>
            </View>
          </TouchableOpacity>
        </SettingsSection>
      </ScrollView>

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-surface p-6 shadow-lg">
            <View className="mb-4 items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-terracotta-100">
                <Ionicons name="warning" size={24} color="#D4896A" />
              </View>
            </View>

            <Text className="mb-2 text-center text-lg font-bold text-warmgray">
              Delete All Data?
            </Text>
            <Text className="mb-4 text-center text-sm text-warmgray-muted">
              This will permanently delete all your contacts and interaction history. This action cannot be undone.
            </Text>

            <Text className="mb-2 text-sm font-medium text-warmgray">
              Type DELETE to confirm:
            </Text>
            <View className="mb-4 min-h-12 rounded-xl border border-border bg-cream px-4 flex-row items-center">
              <TextInput
                className="flex-1 text-base leading-5 text-warmgray"
                style={{ marginTop: -2 }}
                placeholderTextColor="#8B9678"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="DELETE"
                autoCapitalize="characters"
                autoCorrect={false}
                textAlignVertical="center"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl bg-cream py-3"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-warmgray-muted">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl py-3 ${
                  deleteConfirmText === 'DELETE' && !isDeleting ? 'bg-terracotta' : 'bg-terracotta-100'
                }`}
                onPress={confirmDeleteAllData}
                activeOpacity={0.7}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                <Text className={`font-semibold ${
                  deleteConfirmText === 'DELETE' && !isDeleting ? 'text-white' : 'text-terracotta/50'
                }`}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
