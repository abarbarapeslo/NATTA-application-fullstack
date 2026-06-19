// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

/**
 * Release / store identifiers (iOS bundle ID = Android application ID).
 * Must stay stable after the first App Store / Play submission (changing ID = new listing).
 * Replace `com.natta.app` if your org uses another reverse-DNS id (e.g. com.empresa.natta).
 */
const applicationId = "com.natta.app";

const env = {
  // App branding — Expo name / URL slug (expo.dev & eas.json)
  appName: "Natta",
  appSlug: "natta-mobile",
  // S3 URL of the app logo (optional). Empty = use ./assets/images/natta_icon.png in UI
  logoUrl: "",
  // Deep links & OAuth redirects: natta://… — must be unique on the device if multiple apps use schemes
  scheme: "natta",
  iosBundleId: applicationId,
  androidPackage: applicationId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/natta_app_icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    // Bump each App Store / TestFlight upload
    buildNumber: "1",
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    // Bump each Play upload (integer)
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/natta_icon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    googleServicesFile: "./google-services.json",
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/natta_app_icon.png",
  },
  plugins: [
    "expo-router",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/messaging",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos to set a profile picture.",
        cameraPermission:
          "Allow $(PRODUCT_NAME) to access your camera to take a profile picture.",
      },
    ],
    [
      "@react-native-google-signin/google-signin",
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera to record videos.",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone to record videos.",
        recordAudioAndroid: true,
      },
    ],
    [
      "expo-document-picker",
      {
        iCloudContainerEnvironment: "Production",
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/natta_app_icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#E6F4FE",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
        ios: {
          useFrameworks: "static",
        },
      },
    ],
  ],
  updates: {
    url: "https://u.expo.dev/177b4125-5f3a-4f8b-b4f7-d27b1e26fd88",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "177b4125-5f3a-4f8b-b4f7-d27b1e26fd88",
    },
  },
  owner: "abarbaranatta",
};

export default config;
