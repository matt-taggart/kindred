import React from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ConnectionsHeaderProps = {
  onSearchPress: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  isSearching: boolean;
};

export function ConnectionsHeader({ 
  onSearchPress, 
  searchQuery, 
  onSearchChange, 
  isSearching 
}: ConnectionsHeaderProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-8 h-8 items-center justify-center bg-primary/10 rounded-full">
              <Ionicons name="heart" size={16} color="#9DBEBB" />
            </View>
            <Text className="text-xs font-semibold tracking-widest uppercase text-primary/70">
              KINDRED
            </Text>
          </View>
          <Text
            className="text-4xl tracking-tight text-warmgray dark:text-white"
            style={{ fontFamily: 'PlayfairDisplay_500Medium' }}
          >
            Connections
          </Text>
        </View>
        <TouchableOpacity
          testID="search-button"
          onPress={onSearchPress}
          accessibilityLabel={isSearching ? "Close search" : "Search connections"}
          accessibilityRole="button"
          className="p-3 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name={isSearching ? "close" : "search"} size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
      
      {isSearching ? (
        <View className="mt-2">
          <TextInput
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-slate-100 text-lg"
            placeholder="Search by name..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : (
        <Text className="text-slate-500 dark:text-slate-400 text-lg">
          Stay close to the people who matter most.
        </Text>
      )}
    </View>
  );
}
