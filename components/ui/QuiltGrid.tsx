import React from 'react';
import { View, ViewProps } from 'react-native';

interface QuiltGridProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  columns?: 1 | 2;
}

export function QuiltGrid({ className = '', children, columns = 2, ...props }: QuiltGridProps) {
  const defaultTileWidth = columns === 1 ? '100%' : '48%';

  return (
    <View
      className={['flex-row flex-wrap gap-3', className].filter(Boolean).join(' ')}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Check if child has size="large" prop for full width
        const childProps = child.props as { size?: string };
        const isLarge = childProps.size === 'large';

        return (
          <View style={{ width: isLarge || columns === 1 ? '100%' : defaultTileWidth }}>
            {child}
          </View>
        );
      })}
    </View>
  );
}
