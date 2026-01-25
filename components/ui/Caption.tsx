import { Text, TextProps } from 'react-native';

interface CaptionProps extends Omit<TextProps, 'style'> {
  uppercase?: boolean;
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Caption({
  uppercase = false,
  muted = true,
  className = '',
  children,
  ...props
}: CaptionProps) {
  const classes = [
    'font-body',
    'text-xs',
    'text-slate-500',
    'dark:text-slate-400',
    muted && 'opacity-50',
    uppercase && 'uppercase tracking-widest',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Text className={classes} {...props}>
      {children}
    </Text>
  );
}
