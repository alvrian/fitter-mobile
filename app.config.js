export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: "fitter-mobile",
    slug: "fitter-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/fitter_logo.png",
    scheme: "fittermobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/fitter_logo.png",
      resizeMode: "contain",
      backgroundColor: "#2C2C2E",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.alv123123.fittermobile",
      adaptiveIcon: {
        foregroundImage: "./assets/images/fitter_logo.png",
        backgroundColor: "#2C2C2E",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "6ea11217-d1d0-4c4e-976b-a51cf63c665a",
      },
      // 🔥 Forward your Expo Project Variables here
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
});
