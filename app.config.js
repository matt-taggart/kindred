const revenueCatApiKey = process.env.REVENUECAT_API_KEY?.trim();

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
        NSContactsUsageDescription:
          "Kindred imports your contacts to help you set reminders for staying in touch with friends and family. Your contacts remain on your device and are never uploaded to our servers.",
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
    plugins: ["expo-router", "expo-font"],
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
