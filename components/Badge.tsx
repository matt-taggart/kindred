import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type BadgeVariant = 'sage' | 'terracotta' | 'neutral';
type BadgeSize = 'sm' | 'md';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftDot?: boolean;
  right?: ReactNode;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  accessibilityLabel?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  sage: 'bg-sage-100 border border-sage/30',
  terracotta: 'bg-terracotta-100 border border-terracotta/30',
  neutral: 'bg-cream border border-border',
};

const sizeClasses: Record<BadgeSize, { container: string; text: string; dot: string }> = {
  sm: { container: 'px-3 py-1', text: 'text-xs', dot: 'h-2 w-2' },
  md: { container: 'px-4 py-2', text: 'text-sm', dot: 'h-2.5 w-2.5' },
};

export default function Badge({
  label,
  variant = 'neutral',
  size = 'sm',
  leftDot = false,
  right,
  onPress,
  className,
  textClassName,
  accessibilityLabel,
}: BadgeProps) {
  const dotColor =
    variant === 'sage'
      ? 'bg-sage'
      : variant === 'terracotta'
        ? 'bg-terracotta'
        : 'bg-warmgray-muted/40';

  const content = (
    <>
      {leftDot ? (
        <View className={`${sizeClasses[size].dot} rounded-full ${dotColor} mr-2`} />
      ) : null}

      <Text className={`font-semibold text-warmgray ${sizeClasses[size].text} ${textClassName ?? ''}`}>
        {label}
      </Text>

      {right ? <View className="ml-1">{right}</View> : null}
    </>
  );

  const containerClassName = `flex-row items-center rounded-full ${sizeClasses[size].container} ${variantClasses[variant]} ${className ?? ''}`;

  if (onPress) {
    return (
      <TouchableOpacity
        className={containerClassName}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className={containerClassName} accessibilityLabel={accessibilityLabel}>
      {content}
    </View>
  );
}
