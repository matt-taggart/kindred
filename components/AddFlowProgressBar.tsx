import React from 'react';
import { View } from 'react-native';

type AddFlowProgressBarProps = {
  currentStep: number;
  totalSteps?: number;
};

export function AddFlowProgressBar({
  currentStep,
  totalSteps = 3,
}: AddFlowProgressBarProps) {
  return (
    <View
      testID="progress-bar-container"
      className="flex-row gap-2 px-6 py-4"
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentStep,
      }}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isFilled = stepNumber <= currentStep;

        return (
          <View
            key={stepNumber}
            testID="progress-segment"
            className={`flex-1 h-1.5 rounded-full ${
              isFilled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        );
      })}
    </View>
  );
}
