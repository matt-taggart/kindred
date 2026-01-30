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
      className="mb-8"
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
            className={`px-6 py-2 rounded-full ${
              isActive
                ? 'bg-primary dark:bg-primary'
                : 'bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Body
              size="sm"
              weight="medium"
              className={
                isActive
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400'
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
