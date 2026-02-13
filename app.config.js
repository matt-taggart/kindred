const revenueCatApiKey = process.env.REVENUECAT_API_KEY || '';

export default {
  expo: {
    name: "kindred",
    slug: "kindred",
    version: "1.0.0",
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
      revenueCatApiKey: revenueCatApiKey,
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
