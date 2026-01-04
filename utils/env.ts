/**
 * Utility for detecting development mode vs production
 * 
 * In Expo/React Native, use __DEV__ for development checks.
 * This is true during development and false in production builds.
 */

export const isDevelopment = () => {
  return __DEV__ ?? false;
};

export const isProduction = () => {
  return !(__DEV__ ?? false);
};
