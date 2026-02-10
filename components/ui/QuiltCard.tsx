import { Pressable, View, ViewProps } from 'react-native';

type QuiltCardVariant = 'primary' | 'secondary' | 'accent' | 'neutral';
type QuiltCardSize = 'standard' | 'large';

interface QuiltCardProps extends ViewProps {
  variant?: QuiltCardVariant;
  size?: QuiltCardSize;
  pressable?: boolean;
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<QuiltCardVariant, string> = {
  primary: 'bg-primary/15 border-primary/20 dark:bg-primary/20',
  secondary: 'bg-secondary/15 border-secondary/20 dark:bg-secondary/20',
  accent: 'bg-accent/40 border-accent/60 dark:bg-accent/10',
  neutral: 'bg-surface-card border-stroke-soft dark:bg-slate-800/50 dark:border-slate-700',
};

export function QuiltCard({
  variant = 'neutral',
  size = 'standard',
  pressable = false,
  onPress,
  className = '',
  children,
  ...props
}: QuiltCardProps) {
  const baseClasses = [
    'rounded-3xl p-5 border',
    variantClasses[variant],
    size === 'large' && 'row-span-2',
    className,
  ].filter(Boolean).join(' ');

  if (pressable) {
    return (
      <Pressable
        onPress={onPress}
        className={[baseClasses, 'active:scale-[0.98] active:opacity-90'].join(' ')}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClasses} {...props}>
      {children}
    </View>
  );
}
