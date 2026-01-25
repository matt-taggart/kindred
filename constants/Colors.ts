const primary = '#9DBEBB';
const secondary = '#F4ACB7';

export default {
  light: {
    text: '#1f2937',
    background: '#F9FBFA',
    tint: primary,
    tabIconDefault: '#9ca3af',
    tabIconSelected: primary,
  },
  dark: {
    text: '#f1f5f9',
    background: '#121414',
    tint: primary,
    tabIconDefault: '#6b7280',
    tabIconSelected: primary,
  },
  // Expose raw colors for non-Tailwind usage
  primary,
  secondary,
  accent: '#FFE5D9',
};
