import { View, ViewProps } from 'react-native';

interface QuiltGridProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export function QuiltGrid({ className = '', children, ...props }: QuiltGridProps) {
  return (
    <View
      className={['flex-row flex-wrap gap-3', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </View>
  );
}
