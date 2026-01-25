import { Pressable, PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'muted';

interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: keyof typeof MaterialIcons.glyphMap;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  onPress: () => void;
}

const sizeConfig: Record<IconButtonSize, { container: string; icon: number }> = {
  sm: { container: 'w-10 h-10', icon: 20 },
  md: { container: 'w-12 h-12', icon: 24 },
  lg: { container: 'w-14 h-14', icon: 28 },
};

const variantConfig: Record<IconButtonVariant, { container: string; iconColor: string }> = {
  default: {
    container: 'bg-white dark:bg-slate-800 shadow-soft border border-slate-100 dark:border-slate-700',
    iconColor: '#64748b',
  },
  primary: {
    container: 'bg-primary shadow-lg shadow-primary/30',
    iconColor: '#ffffff',
  },
  muted: {
    container: 'bg-slate-100 dark:bg-slate-800',
    iconColor: '#9ca3af',
  },
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  disabled = false,
  onPress,
  ...props
}: IconButtonProps) {
  const { container: sizeClass, icon: iconSize } = sizeConfig[size];
  const { container: variantClass, iconColor } = variantConfig[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'rounded-full items-center justify-center',
        'active:scale-95',
        sizeClass,
        variantClass,
        disabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <MaterialIcons name={icon} size={iconSize} color={iconColor} />
    </Pressable>
  );
}
