import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const RELATIONSHIP_TYPES = [
  'Friend',
  'Family',
  'Mentor',
  'Other',
] as const;

type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

type RelationshipTypePickerProps = {
  selected: string | null;
  onSelect: (type: string | null) => void;
};

export function RelationshipTypePicker({
  selected,
  onSelect,
}: RelationshipTypePickerProps) {
  const handlePress = (type: RelationshipType) => {
    if (selected === type) {
      onSelect(null);
    } else {
      onSelect(type);
    }
  };

  return (
    <View
      testID="relationship-type-picker"
      className="flex-row flex-wrap gap-2"
    >
      {RELATIONSHIP_TYPES.map((type) => {
        const isSelected = selected === type;

        return (
          <TouchableOpacity
            key={type}
            onPress={() => handlePress(type)}
            activeOpacity={0.7}
            accessibilityLabel={type}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <View
              testID={`relationship-pill-${type}`}
              className={`px-4 py-2.5 rounded-full border ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-surface-card border-stroke-soft'
              }`}
            >
              <Text
                className={`font-body text-base ${
                  isSelected ? 'text-white' : 'text-text-muted'
                }`}
              >
                {type}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
