import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function PrimaryButton({
  label,
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'bg-primary rounded-full py-4 px-6 flex-row items-center justify-center',
        'shadow-lg shadow-primary/25',
        'active:scale-[0.98]',
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="font-body font-bold text-white text-base">
            {label}
          </Text>
          {icon && (
            <MaterialIcons name={icon} size={20} color="#ffffff" />
          )}
        </View>
      )}
    </Pressable>
  );
}
