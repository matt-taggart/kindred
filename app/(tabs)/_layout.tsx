import React from "react";
import { Platform, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { AddConnectionSheet } from "@/components";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isAddSheetVisible, setIsAddSheetVisible] = React.useState(false);

  const isDark = colorScheme === "dark";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarInactiveTintColor: isDark ? "#7A8DA4" : "#7F8EA2",
          tabBarStyle: {
            height: Platform.OS === "ios" ? 104 : 84,
            paddingBottom: Platform.OS === "ios" ? 40 : 20,
            paddingTop: 16,
            backgroundColor: isDark
              ? "rgba(15, 23, 42, 0.8)"
              : "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#1e293b" : "#f1f5f9",
            elevation: 0,
            shadowOpacity: 0,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            marginTop: 5,
            letterSpacing: 0.2,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: "Connections",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Moments",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Preferences",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      <AddConnectionSheet
        visible={isAddSheetVisible}
        onClose={() => setIsAddSheetVisible(false)}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsAddSheetVisible(true)}
        style={styles.fab}
      >
        <Ionicons name="heart" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
});
