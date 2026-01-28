import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Caption } from './ui/Caption';

type ConnectionNotesCardProps = {
  notes: string;
  onChangeNotes: (text: string) => void;
  placeholder?: string;
};

export function ConnectionNotesCard({
  notes,
  onChangeNotes,
  placeholder = 'What matters to you about this connection?',
}: ConnectionNotesCardProps) {
  return (
    <View className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons
          name="sparkles"
          size={18}
          color="#79947D"
        />
        <Caption uppercase className="tracking-wider font-semibold text-primary/70">
          Notes
        </Caption>
      </View>
      <TextInput
        value={notes}
        onChangeText={onChangeNotes}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        multiline
        accessibilityLabel="Connection notes"
        className="bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-body"
        style={{ height: 96 }}
        textAlignVertical="top"
      />
    </View>
  );
}
