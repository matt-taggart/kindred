import { Text, TextProps } from 'react-native';

type HeadingSize = 1 | 2 | 3 | 4;
type HeadingWeight = 'medium' | 'semibold' | 'bold';

interface HeadingProps extends Omit<TextProps, 'style'> {
  size?: HeadingSize;
  weight?: HeadingWeight;
  className?: string;
  children: React.ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  1: 'text-3xl', // 32px
  2: 'text-2xl', // 24px
  3: 'text-xl',  // 20px
  4: 'text-base', // 16px
};

const weightClasses: Record<HeadingWeight, string> = {
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export function Heading({
  size = 2,
  weight = 'bold',
  className = '',
  children,
  ...props
}: HeadingProps) {
  const classes = [
    'font-display',
    'text-slate-900',
    'dark:text-slate-100',
    sizeClasses[size],
    weightClasses[weight],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Text className={classes} {...props}>
      {children}
    </Text>
  );
}
