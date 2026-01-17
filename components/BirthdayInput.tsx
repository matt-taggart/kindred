import React, { useState, useEffect } from 'react';
import { View, TextInput, Text } from 'react-native';
import { validateBirthday, normalizeBirthday } from '@/utils/birthdayValidation';

interface BirthdayInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export default function BirthdayInput({ value, onChange, autoFocus = false }: BirthdayInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setInputValue(text);

    const trimmed = text.trim();

    if (trimmed === '') {
      setError(null);
      onChange('');
      return;
    }

    const validation = validateBirthday(trimmed);

    if (validation.valid) {
      setError(null);
      onChange(normalizeBirthday(trimmed));
    } else {
      setError(validation.error || 'Invalid date');
    }
  };

  return (
    <View>
      <TextInput
        value={inputValue}
        onChangeText={handleChangeText}
        placeholder="MM/DD"
        placeholderTextColor="#A0A0A0"
        keyboardType="numbers-and-punctuation"
        autoFocus={autoFocus}
        maxLength={5}
        className="text-2xl font-bold text-center py-4 text-warmgray"
      />
      <Text className="text-sm text-warmgray-muted text-center mt-1">
        Format: MM/DD
      </Text>
      {error && (
        <Text className="text-sm text-terracotta text-center mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
