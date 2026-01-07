import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';

import { useUserStore } from '@/lib/userStore';
import { resetDatabase } from '@/services/contactService';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
            className="flex-row items-center justify-between bg-white px-4 py-4"
            onPress={handleDeleteAllData}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
              <Text className="text-base text-red-500">Delete All Data</Text>
            </View>
          </TouchableOpacity>
        </SettingsSection>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-white p-6 shadow-lg">
            <View className="mb-4 items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="warning" size={24} color="#ef4444" />
              </View>
            </View>
            
            <Text className="mb-2 text-center text-lg font-bold text-gray-900">
              Delete All Data?
            </Text>
            <Text className="mb-4 text-center text-sm text-gray-600">
              This will permanently delete all your contacts and interaction history. This action cannot be undone.
            </Text>

            <Text className="mb-2 text-sm font-medium text-gray-700">
              Type DELETE to confirm:
            </Text>
            <View className="mb-4 min-h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 flex-row items-center">
              <TextInput
                className="flex-1 text-base leading-5 text-gray-900"
                style={{ marginTop: -2 }}
                placeholderTextColor="#9ca3af"
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
                className="flex-1 items-center rounded-xl bg-gray-100 py-3"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl py-3 ${
                  deleteConfirmText === 'DELETE' && !isDeleting ? 'bg-red-500' : 'bg-red-200'
                }`}
                onPress={confirmDeleteAllData}
                activeOpacity={0.7}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                <Text className={`font-semibold ${
                  deleteConfirmText === 'DELETE' && !isDeleting ? 'text-white' : 'text-red-300'
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
