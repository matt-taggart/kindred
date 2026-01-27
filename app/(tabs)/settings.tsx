import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EnhancedPaywallModal } from "@/components/EnhancedPaywallModal";
import Colors from "@/constants/Colors";
import { useUserStore } from "@/lib/userStore";
import { resetDatabase } from "@/services/contactService";
import { cancelAllReminders } from "@/services/notificationService";

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  variant?: "default" | "destructive";
  rightElement?: React.ReactNode;
  showChevron?: boolean;
};

function SettingsRow({
  icon,
  label,
  onPress,
  variant = "default",
  rightElement,
  showChevron = true,
}: SettingsRowProps) {
  const isDestructive = variant === "destructive";
  const iconBgColor = isDestructive ? "bg-red-50" : "bg-sage-light";
  const iconColor = isDestructive ? "#EF4444" : Colors.primary;
  const textColor = isDestructive ? "text-red-400" : "text-slate-700";

  const content = (
    <View className="flex-row items-center justify-between px-6 py-5">
      <View className="flex-row items-center gap-4">
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text
          className={`text-[15px] font-medium ${textColor}`}
          style={{ fontFamily: "Outfit_500Medium" }}
        >
          {label}
        </Text>
      </View>
      {rightElement ??
        (showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        ))}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function SettingsDivider() {
  return <View className="mx-6 border-t border-slate-100" />;
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <View className="mb-10">
      <View className="mb-4 px-4">
        <Text
          className="mb-1 text-[10px] font-semibold uppercase tracking-[3px] text-primary/70"
          style={{ fontFamily: "Outfit_600SemiBold" }}
        >
          {title}
        </Text>
        {description && (
          <Text
            className="text-[13px] text-text-soft/80"
            style={{ fontFamily: "Outfit_400Regular" }}
          >
            {description}
          </Text>
        )}
      </View>
      <View
        className="overflow-hidden rounded-3xl border border-slate-50 bg-card-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 20,
          elevation: 2,
        }}
      >
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
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotifications = () => {
    router.push("/settings/notifications");
  };

  const handleClearAllNotifications = async () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to cancel all scheduled notifications? This is useful for debugging.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await cancelAllReminders();
            Alert.alert("Done", "All notifications have been cleared.");
          },
        },
      ],
    );
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handleRestorePurchase = async () => {
    await restorePurchase();
    if (useUserStore.getState().isPro) {
      Alert.alert("Success", "Your purchase has been restored.");
    }
  };

  const handleDeleteAllData = () => {
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const resetProStatus = __DEV__
    ? () => {
        Alert.alert(
          "Reset Pro Status",
          "Are you sure you want to reset your Pro status? This will make the app behave as if you never upgraded.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Reset",
              style: "destructive",
              onPress: () => {
                useUserStore.getState().setIsPro(false);
                Alert.alert("Done", "Pro status has been reset.");
              },
            },
          ],
        );
      }
    : undefined;

  const confirmDeleteAllData = async () => {
    if (deleteConfirmText !== "DELETE") return;

    setIsDeleting(true);
    try {
      await resetDatabase();
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      Alert.alert("Done", "All your data has been deleted.");
    } catch (error) {
      Alert.alert("Error", "Failed to delete data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center px-8 pb-4 pt-8">
          <View className="mb-6 h-12 w-12 items-center justify-center rounded-full bg-sage-light">
            <Ionicons name="heart" size={28} color={Colors.primary} />
          </View>
          <Text
            className="text-3xl tracking-tight text-slate-900"
            style={{ fontFamily: "PlayfairDisplay_500Medium" }}
          >
            Settings
          </Text>
          <Text
            className="mt-1 text-sm italic text-text-soft"
            style={{ fontFamily: "Outfit_300Light" }}
          >
            Your peaceful space
          </Text>
        </View>

        {/* Content */}
        <View className="px-5 pt-4">
          {/* Nurturing Preferences */}
          <SettingsSection
            title="Nurturing Preferences"
            description="Choose when Kindred gently nudges you"
          >
            <SettingsRow
              icon="notifications-outline"
              label="Reminder Schedule"
              onPress={handleNotifications}
            />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            {!isPro && (
              <>
                <SettingsRow
                  icon="sparkles-outline"
                  label="Upgrade to Pro"
                  onPress={handleUpgrade}
                />
                <SettingsDivider />
              </>
            )}
            <SettingsRow
              icon="refresh-outline"
              label="Restore Purchases"
              onPress={handleRestorePurchase}
              showChevron={false}
              rightElement={
                purchaseState.isRestoring ? (
                  <Text
                    className="text-sm text-text-soft"
                    style={{ fontFamily: "Outfit_400Regular" }}
                  >
                    Restoring...
                  </Text>
                ) : null
              }
            />
            {isPro && (
              <>
                <SettingsDivider />
                <SettingsRow
                  icon="checkmark-circle"
                  label="Kindred Pro"
                  showChevron={false}
                  rightElement={
                    <Text
                      className="text-sm font-medium text-primary"
                      style={{ fontFamily: "Outfit_500Medium" }}
                    >
                      Active
                    </Text>
                  }
                />
              </>
            )}
          </SettingsSection>

          {/* Data */}
          <SettingsSection title="Data">
            <SettingsRow
              icon="trash-outline"
              label="Delete All Data"
              onPress={handleDeleteAllData}
              variant="destructive"
              showChevron={false}
            />
          </SettingsSection>

          {/* Debug (dev only) */}
          {__DEV__ && (
            <SettingsSection title="Debug">
              <SettingsRow
                icon="close-circle-outline"
                label="Clear All Notifications"
                onPress={handleClearAllNotifications}
              />
              {resetProStatus && (
                <>
                  <SettingsDivider />
                  <SettingsRow
                    icon="refresh-circle-outline"
                    label="Reset Pro Status"
                    onPress={resetProStatus}
                  />
                </>
              )}
            </SettingsSection>
          )}

          {/* Version Footer */}
          <Text
            className="mt-2 text-center text-[11px] text-text-soft/40"
            style={{ fontFamily: "Outfit_400Regular" }}
          >
            Version 2.4.0
          </Text>
        </View>
      </ScrollView>

      <EnhancedPaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View
            className="w-full rounded-pill bg-card-white p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <View className="mb-4 items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>
            </View>

            <Text
              className="mb-2 text-center text-lg text-slate-900"
              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
            >
              Delete All Data?
            </Text>
            <Text
              className="mb-4 text-center text-sm text-text-soft"
              style={{ fontFamily: "Outfit_400Regular" }}
            >
              This will permanently delete all your contacts and interaction
              history. This action cannot be undone.
            </Text>

            <Text
              className="mb-2 text-sm text-slate-700"
              style={{ fontFamily: "Outfit_500Medium" }}
            >
              Type DELETE to confirm:
            </Text>
            <View className="mb-4 min-h-12 flex-row items-center rounded-inner-pill border border-slate-100 bg-off-white px-4">
              <TextInput
                className="flex-1 text-base leading-5 text-slate-700"
                style={{ fontFamily: "Outfit_400Regular", marginTop: -2 }}
                placeholderTextColor="#94A3B8"
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
                className="flex-1 items-center rounded-inner-pill bg-slate-100 py-3"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-text-soft"
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-inner-pill py-3 ${
                  deleteConfirmText === "DELETE" && !isDeleting
                    ? "bg-red-500"
                    : "bg-red-100"
                }`}
                onPress={confirmDeleteAllData}
                activeOpacity={0.7}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
              >
                <Text
                  className={`${
                    deleteConfirmText === "DELETE" && !isDeleting
                      ? "text-white"
                      : "text-red-300"
                  }`}
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
