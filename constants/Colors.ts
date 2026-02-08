const primary = '#9DBEBB';
const secondary = '#F4ACB7';
const brandNavy = '#2D3648';

// New design system colors
const sageLight = '#E8EFEA';
const offWhite = '#FDFCFB';
const textSoft = '#5C635C';
const warning = '#d97706';
const warningDark = '#fbbf24';

export default {
  light: {
    text: '#1f2937',
    background: '#FFFFFF',
    tint: primary,
    tabIconDefault: '#94a3b8',
    tabIconSelected: primary,
  },
  dark: {
    text: '#f1f5f9',
    background: '#121414',
    tint: primary,
    tabIconDefault: '#64748b',
    tabIconSelected: primary,
  },
  // Expose raw colors for non-Tailwind usage
  primary,
  secondary,
  accent: '#FFE5D9',
  brandNavy,
  sageLight,
  offWhite,
  textSoft,
  warning,
  warningDark,
};
