import React from "react";
import { Platform, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { AddConnectionSheet } from "@/components";

const TAB_ICON_SIZE = 22;

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
              : "rgba(253, 251, 247, 0.96)",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#1e293b" : "#E9E3DA",
            elevation: 0,
            shadowOpacity: 0,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabel: ({ color, children }) => (
            <Text style={[styles.tabLabel, { color }]}>{children}</Text>
          ),
          tabBarAllowFontScaling: false,
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
                size={TAB_ICON_SIZE}
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
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarLabel: () => null,
            tabBarItemStyle: styles.centerTabItem,
            tabBarButton: (props) => (
              <TouchableOpacity
                onPress={() => setIsAddSheetVisible(true)}
                onLongPress={props.onLongPress ?? undefined}
                activeOpacity={0.85}
                accessibilityLabel={props.accessibilityLabel ?? "Add connection"}
                accessibilityRole={props.accessibilityRole}
                accessibilityState={props.accessibilityState}
                testID={props.testID}
                style={[props.style, styles.centerTabButton]}
              >
                <View style={styles.centerTabButtonInner}>
                  <Ionicons name="person-add-outline" size={20} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={TAB_ICON_SIZE}
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
    </View>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
    letterSpacing: 0,
  },
  centerTabItem: {
    width: 64,
  },
  centerTabButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerTabButtonInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
