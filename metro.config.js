// Learn more: https://docs.expo.dev/guides/metro-config/ and https://www.nativewind.dev/quick-starts/expo
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure pnpm node_modules are properly resolved
config.watchFolders = [path.resolve(__dirname, 'node_modules')];
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
};

module.exports = withNativeWind(config, { input: './global.css' });
