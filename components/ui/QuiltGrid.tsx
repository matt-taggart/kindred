import React from 'react';
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
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Check if child has size="large" prop for full width
        const isLarge = child.props.size === 'large';

        return (
          <View style={{ width: isLarge ? '100%' : '48%' }}>
            {child}
          </View>
        );
      })}
    </View>
  );
}
