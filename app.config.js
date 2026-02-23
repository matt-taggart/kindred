const revenueCatApiKey = process.env.REVENUECAT_API_KEY?.trim();
const contactsPermissionMessage =
  "Kindred uses your contacts so you can choose people (for example, close friends or family) and set reminders to check in. Kindred only reads selected names, phone numbers, and birthdays on your device and never uploads or shares your contacts.";

if (!revenueCatApiKey && process.env.EAS_BUILD === 'true') {
  throw new Error(
    'Missing REVENUECAT_API_KEY for EAS build. Add it in EAS Secrets/Environment Variables for this profile.'
  );
}

export default {
  expo: {
    name: "kindred",
    slug: "kindred",
    version: "1.0.0",
    updates: {
      url: "https://u.expo.dev/0224db90-2483-46ad-973f-036d6f15446f",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/logo-font-cream-new.png",
      resizeMode: "contain",
      backgroundColor: "#F3F0E6",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.redelklabs.kindred",
      buildNumber: "1",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSContactsUsageDescription: contactsPermissionMessage,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.ico",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-contacts",
        {
          contactsPermission: contactsPermissionMessage,
        },
      ],
    ],
    extra: {
      revenueCatApiKey: revenueCatApiKey ?? '',
      router: {},
      eas: {
        projectId: "0224db90-2483-46ad-973f-036d6f15446f",
      },
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
