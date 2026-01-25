import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SecondaryButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function SecondaryButton({
  label,
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'bg-slate-100 dark:bg-slate-800 rounded-full py-4 px-6 flex-row items-center justify-center',
        'active:scale-[0.98]',
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <ActivityIndicator color="#64748b" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="font-body font-semibold text-slate-500 dark:text-slate-400 text-base">
            {label}
          </Text>
          {icon && (
            <MaterialIcons name={icon} size={20} color="#64748b" />
          )}
        </View>
      )}
    </Pressable>
  );
}
