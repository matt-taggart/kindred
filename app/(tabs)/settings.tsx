import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import Purchases from "react-native-purchases";
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
import { PageHeader } from "@/components/PageHeader";
import { Body, Caption } from "@/components/ui";
import Colors from "@/constants/Colors";
import { useUserStore } from "@/lib/userStore";
import { resetDatabase } from "@/services/contactService";
import { IAPService } from "@/services/iapService";
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
  const iconBgColor = isDestructive ? "bg-rose-soft" : "bg-sage-light";
  const iconColor = isDestructive ? "#F87171" : Colors.primary;
  const textColor = isDestructive ? "text-red-300" : "text-text-muted";

  const content = (
    <View className="flex-row items-center justify-between px-6 py-5">
      <View className="flex-row items-center gap-4">
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Body weight="medium" className={textColor}>
          {label}
        </Body>
      </View>
      {rightElement ??
        (showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#B2BCC9" />
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
  return <View className="mx-6 border-t border-stroke-soft" />;
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const toErrorMessage = (error: unknown): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
};

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <View className="mb-10">
      <View className="mb-4 px-4">
        <Caption
          uppercase
          muted={false}
          className="mb-1 font-semibold tracking-[3px] text-primary/70"
        >
          {title}
        </Caption>
        {description && (
          <Body size="sm" className="text-text-muted/80">
            {description}
          </Body>
        )}
      </View>
      <View
        className="overflow-hidden rounded-3xl border border-stroke-soft bg-surface-card"
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
  const appVersion = Constants.nativeAppVersion ?? Constants.expoConfig?.version ?? "Unknown";
  const buildVersion = Constants.nativeBuildVersion;
  const versionLabel = buildVersion ? `Version ${appVersion} (${buildVersion})` : `Version ${appVersion}`;

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
      console.error("Failed to delete all data:", error);
      Alert.alert("Error", "Failed to delete data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopySupportId = async () => {
    let appUserId = "";
    let initializeErrorMessage = "";

    try {
      let isConfigured = await Purchases.isConfigured();

      if (!isConfigured) {
        try {
          await IAPService.initialize();
          isConfigured = await Purchases.isConfigured();
        } catch (initializeError) {
          initializeErrorMessage = toErrorMessage(initializeError);
          console.warn("RevenueCat unavailable while fetching Support ID:", initializeError);
        }
      }

      if (isConfigured) {
        try {
          appUserId = (await Purchases.getAppUserID())?.trim() ?? "";
        } catch (appUserIdError) {
          console.warn("Failed to fetch Support ID via getAppUserID:", appUserIdError);
        }

        if (!appUserId) {
          try {
            const customerInfo = await Purchases.getCustomerInfo();
            appUserId = customerInfo.originalAppUserId?.trim() ?? "";
          } catch (customerInfoError) {
            console.warn("Failed to fetch Support ID via getCustomerInfo:", customerInfoError);
          }
        }
      }

      if (!appUserId) {
        const details = initializeErrorMessage.includes("Invalid API key")
          ? "Support ID is unavailable in this build. Use a development/TestFlight build where RevenueCat is configured."
          : "Could not find Support ID yet. Try restoring purchases, then try again.";
        Alert.alert("Support ID unavailable", details);
        return;
      }

      try {
        const Clipboard = await import("expo-clipboard");
        await Clipboard.setStringAsync(appUserId);
        Alert.alert("Success", "Support ID copied to clipboard.");
      } catch (clipboardError) {
        console.warn("Clipboard unavailable, showing support ID instead:", clipboardError);
        Alert.alert("Support ID", appUserId);
      }
    } catch (error) {
      console.error("Failed to copy Support ID:", error);
      Alert.alert("Error", "Failed to retrieve Support ID.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-page dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Settings" brandingToHeadingGapClassName="mb-4" />

        {/* Content */}
        <View>
          {/* Notifications */}
          <SettingsSection
            title="Notifications"
            description="Choose when Kindred gently nudges you."
          >
            <SettingsRow
              icon="notifications-outline"
              label="Reminder Schedule"
              onPress={handleNotifications}
            />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            <SettingsRow
              icon="copy-outline"
              label="Copy Support ID"
              onPress={handleCopySupportId}
              showChevron={false}
            />
            <SettingsDivider />
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
                  <Body size="sm" className="text-text-soft">
                    Restoring...
                  </Body>
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
                    <Body size="sm" weight="medium" className="text-primary">
                      Active
                    </Body>
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
          <Caption muted className="mt-2 text-center text-text-soft/40">
            {versionLabel}
          </Caption>
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
            className="w-full rounded-3xl bg-surface-card border border-stroke-soft p-6"
            style={{
              maxWidth: 360,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <View className="mb-4 items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>
            </View>

            <Body
              size="lg"
              className="mb-2 text-center font-display font-semibold text-text-strong"
            >
              Delete All Data?
            </Body>
            <Body size="sm" className="mb-4 text-center text-text-muted">
              This will permanently delete all your contacts and interaction
              history. This action cannot be undone.
            </Body>

            <Body size="sm" weight="medium" className="mb-2">
              Type DELETE to confirm:
            </Body>
            <View className="mb-4 min-h-12 flex-row items-center rounded-inner-pill border border-stroke-soft bg-off-white px-4">
              <TextInput
                className="flex-1 text-base leading-5 text-text-muted"
                style={{ fontFamily: "Outfit_400Regular", marginTop: -2 }}
                placeholderTextColor="#9AA3AF"
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
                className="flex-1 items-center rounded-inner-pill bg-surface-soft py-3"
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
