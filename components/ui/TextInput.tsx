import { View, TextInput as RNTextInput, TextInputProps as RNTextInputProps, Text } from 'react-native';
import { useState } from 'react';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function TextInput({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputClasses = [
    'bg-slate-50 dark:bg-slate-800/50',
    'rounded-2xl py-5 px-6',
    'text-xl font-medium',
    'text-slate-900 dark:text-slate-100',
    isFocused && !error && 'ring-2 ring-primary',
    error && 'ring-2 ring-red-500',
    className,
  ].filter(Boolean).join(' ');

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-slate-400 uppercase tracking-widest ml-1 mb-4">
          {label}
        </Text>
      )}
      <RNTextInput
        className={inputClasses}
        placeholderTextColor="#cbd5e1"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-2 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
