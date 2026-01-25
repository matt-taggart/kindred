import { Text, TextProps } from 'react-native';

type BodySize = 'sm' | 'base' | 'lg';
type BodyWeight = 'light' | 'regular' | 'medium';

interface BodyProps extends Omit<TextProps, 'style'> {
  size?: BodySize;
  weight?: BodyWeight;
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizeClasses: Record<BodySize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

const weightClasses: Record<BodyWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
};

export function Body({
  size = 'base',
  weight = 'regular',
  muted = false,
  className = '',
  children,
  ...props
}: BodyProps) {
  const classes = [
    'font-body',
    'text-slate-700',
    'dark:text-slate-200',
    sizeClasses[size],
    weightClasses[weight],
    muted && 'opacity-60',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Text className={classes} {...props}>
      {children}
    </Text>
  );
}
