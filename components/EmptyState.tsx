import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body } from './ui';
import Colors from '@/constants/Colors';

type EmptyStateAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actions?: EmptyStateAction[];
};

export function EmptyState({ icon, title, subtitle, actions = [] }: EmptyStateProps) {
  return (
    <View className="items-center py-16 px-6">
      <View className="w-[72px] h-[72px] rounded-full bg-sage-light items-center justify-center mb-6">
        <Ionicons name={icon} size={32} color={Colors.primary} />
      </View>

      <Heading size={3} className="text-center mb-3">
        {title}
      </Heading>

      {subtitle && (
        <Body muted className="text-center max-w-[280px]">
          {subtitle}
        </Body>
      )}

      {actions.length > 0 && (
        <View className="w-full mt-8">
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={action.onPress}
              className="w-full bg-white dark:bg-card-dark py-4 px-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-row items-center justify-between mb-3"
              activeOpacity={0.85}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                  <Ionicons name={action.icon} size={20} color={Colors.primary} />
                </View>
                <Body weight="medium">{action.label}</Body>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D1D6" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
