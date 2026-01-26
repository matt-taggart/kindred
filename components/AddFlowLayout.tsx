import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AddFlowProgressBar } from './AddFlowProgressBar';

type AddFlowLayoutProps = {
  currentStep: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onSkip?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: ReactNode;
};

export function AddFlowLayout({
  currentStep,
  title,
  subtitle,
  onBack,
  onSkip,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  children,
}: AddFlowLayoutProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f1f5f9' : '#0f172a';

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Progress Bar */}
      <AddFlowProgressBar currentStep={currentStep} totalSteps={3} />

      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        className="mx-4 mb-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 items-center justify-center"
      >
        <Ionicons name="chevron-back-outline" size={20} color={iconColor} />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-2xl font-heading font-bold text-slate-800 dark:text-slate-100">
          {title}
        </Text>

        {/* Subtitle (optional) */}
        {subtitle && (
          <Text
            testID="subtitle"
            className="text-base text-slate-500 dark:text-slate-400 mt-2"
          >
            {subtitle}
          </Text>
        )}

        {/* Spacer */}
        <View className="h-8" />

        {/* Children Content */}
        {children}
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark px-6 pb-8 pt-4 shadow-lg">
        <View className="flex-row justify-between items-center">
          {/* Skip Button */}
          {onSkip ? (
            <TouchableOpacity
              onPress={onSkip}
              accessibilityLabel="Skip"
              accessibilityRole="button"
            >
              <Text className="text-slate-500 dark:text-slate-400 font-medium text-base">
                Skip
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {/* Next Button */}
          <TouchableOpacity
            testID="next-button"
            onPress={nextDisabled ? undefined : onNext}
            disabled={nextDisabled}
            accessibilityLabel={nextLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: nextDisabled }}
            className={`bg-primary px-8 py-3.5 rounded-full ${
              nextDisabled ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-semibold text-base">
              {nextLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
