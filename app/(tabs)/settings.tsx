import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Modal, Switch } from 'react-native';

import { useUserStore } from '@/lib/userStore';
import { resetDatabase } from '@/services/contactService';
import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  description?: string;
};

function SettingsRow({ icon, label, onPress, showChevron = true, rightElement, description }: SettingsRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between bg-surface px-5 py-5 border-b border-border/50 last:border-b-0"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View className="flex-row items-center gap-4 flex-1">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-sage/10">
           <Ionicons name={icon} size={20} color="#5C6356" />
        </View>
        <View className="flex-1">
            <Text className="text-lg font-medium text-slate-900">{label}</Text>
            {description && <Text className="text-sm text-sage-muted mt-0.5">{description}</Text>}
        </View>
      </View>
      {rightElement ?? (showChevron && <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />)}
    </TouchableOpacity>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="mb-3 px-5 text-sm font-semibold uppercase tracking-wide text-sage-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-3xl border border-border/50 shadow-sm shadow-slate-200/50 bg-surface">
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPro, restorePurchase, purchaseState } = useUserStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [quietMode, setQuietMode] = useState(false);

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
      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-8 text-3xl font-semibold text-slate-900 tracking-tight">Settings</Text>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon="notifications-outline"
            label="Reminders"
            description="Choose when Kindred gently nudges you"
            onPress={handleNotifications}
          />
          <SettingsRow
            icon="time-outline"
            label="Your rhythm"
            description="Default reminder frequency for new connections"
            onPress={() => Alert.alert('Coming Soon', 'Global default settings are coming soon.')}
          />
           <SettingsRow
            icon="moon-outline"
            label="Quiet mode"
            description="Pause reminders without losing connections"
            showChevron={false}
            rightElement={
                <Switch
                    value={quietMode}
                    onValueChange={setQuietMode}
                    trackColor={{ false: '#E8E4DA', true: '#9CA986' }}
                    thumbColor={'#FFFFFF'}
                />
            }
          />
        </SettingsSection>

        <SettingsSection title="Kindred">
          {!isPro && (
             <SettingsRow
                icon="sparkles-outline"
                label="Upgrade to Pro"
                description="Support the journey"
                onPress={handleUpgrade}
              />
          )}
          <SettingsRow
            icon="refresh-outline"
            label="Restore Purchases"
            onPress={handleRestorePurchase}
            showChevron={false}
            rightElement={
              purchaseState.isRestoring ? (
                <Text className="text-sm text-sage-muted">Restoring...</Text>
              ) : null
            }
          />
          {isPro && (
            <SettingsRow
                icon="checkmark-circle"
                label="Kindred Pro"
                description="Active"
                showChevron={false}
                rightElement={<Text className="text-sage font-medium">Thanks!</Text>}
            />
          )}
           <SettingsRow
            icon="information-circle-outline"
            label="About Kindred"
            onPress={() => Alert.alert('Kindred', 'Version 1.0.0\nA gentle way to nurture connection.')}
          />
        </SettingsSection>

        <SettingsSection title="Data Management">
          {__DEV__ && resetProStatus && (
              <SettingsRow
                icon="refresh-circle-outline"
                label="Reset Pro Status"
                onPress={resetProStatus}
              />
          )}
          <SettingsRow
            icon="trash-outline"
            label="Delete All Data"
            onPress={handleDeleteAllData}
            rightElement={<Ionicons name="chevron-forward" size={20} color="#ef4444" />}
          />
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
          <View className="w-full rounded-3xl bg-surface p-6 shadow-lg border border-border">
            <View className="mb-4 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="warning-outline" size={32} color="#ef4444" />
              </View>
            </View>
            
            <Text className="mb-2 text-center text-xl font-bold text-slate-900">
              Delete All Data?
            </Text>
            <Text className="mb-6 text-center text-base text-slate-600">
              This will permanently delete all your contacts and interaction history. This action cannot be undone.
            </Text>

            <Text className="mb-2 text-sm font-medium text-slate-700 ml-1">
              Type DELETE to confirm:
            </Text>
            <View className="mb-6 min-h-14 rounded-2xl border border-border bg-white px-4 flex-row items-center">
              <TextInput
                className="flex-1 text-lg leading-6 text-slate-900"
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
                className="flex-1 items-center rounded-2xl bg-cream border border-border py-4"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-slate-600 text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-2xl py-4 ${
                  deleteConfirmText === 'DELETE' && !isDeleting ? 'bg-red-500' : 'bg-red-200'
                }`}
                onPress={confirmDeleteAllData}
                activeOpacity={0.7}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                <Text className={`font-semibold text-lg ${
                  deleteConfirmText === 'DELETE' && !isDeleting ? 'text-white' : 'text-red-100'
                }`}>
                  {isDeleting ? '...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
