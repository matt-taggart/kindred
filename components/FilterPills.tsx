import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Body } from './ui';

export type FilterOption = 'all' | 'due' | 'archived';

type FilterPillsProps = {
  selected: FilterOption;
  counts: { all: number; due: number; archived: number };
  onSelect: (filter: FilterOption) => void;
};

const filterLabels: Record<FilterOption, string> = {
  all: 'All',
  due: 'Due',
  archived: 'Archived',
};

export function FilterPills({ selected, counts, onSelect }: FilterPillsProps) {
  const filters: FilterOption[] = ['all', 'due', 'archived'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-7"
      contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
    >
      {filters.map((filter) => {
        const isActive = selected === filter;
        const count = counts[filter];

        return (
          <TouchableOpacity
            key={filter}
            testID={`filter-${filter}`}
            onPress={() => onSelect(filter)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${filterLabels[filter].toLowerCase()}, ${count} connections`}
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.85}
            className={`px-6 py-2.5 min-h-11 rounded-full border ${
              isActive
                ? 'bg-primary border-primary/30 dark:bg-primary dark:border-primary/40'
                : 'bg-surface-card dark:bg-card-dark border-stroke-soft dark:border-slate-800'
            }`}
          >
            <Body
              size="base"
              weight="medium"
              className={
                isActive
                  ? 'text-white'
                  : 'text-text-muted dark:text-slate-300'
              }
            >
              {filterLabels[filter]} · {count}
            </Body>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
