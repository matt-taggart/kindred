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
import { PageHeader } from './PageHeader';
import Colors from '@/constants/Colors';

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
  showBackButton?: boolean;
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
  showBackButton = false,
}: AddFlowLayoutProps) {
  const colorScheme = useColorScheme();
  const iconColor = Colors.primary;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Progress Bar */}
      <AddFlowProgressBar currentStep={currentStep} totalSteps={3} />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader 
          title={title}
          subtitle={subtitle}
          showBranding={false}
          leftElement={
             <TouchableOpacity
              onPress={onBack}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="w-10 h-10 -ml-2 items-center justify-center rounded-full active:bg-slate-100"
            >
              <Ionicons name="chevron-back" size={24} color={iconColor} />
            </TouchableOpacity>
          }
        />

        {/* Spacer */}
        <View className="h-4" />

        {/* Children Content */}
        {children}
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark px-6 pb-8 pt-4 border-t border-slate-100 dark:border-slate-800">
        <View className="flex-row justify-between items-center">
          {/* Skip/Back Button */}
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
          ) : showBackButton ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityLabel="Back"
              accessibilityRole="button"
            >
              <Text className="text-slate-500 dark:text-slate-400 font-medium text-base">
                Back
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
            className={`bg-primary px-8 py-3.5 rounded-full shadow-sm ${
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
