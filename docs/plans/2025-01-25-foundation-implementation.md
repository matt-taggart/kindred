# Design Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the visual foundation (colors, fonts, UI components) for the Kindred redesign.

**Architecture:** Update Tailwind config with new design tokens, load Google Fonts via expo-google-fonts, create reusable UI components in `components/ui/` that use NativeWind for styling.

**Tech Stack:** React Native, Expo, NativeWind (Tailwind), expo-google-fonts, TypeScript

---

## Task 1: Install Font Packages

**Files:**
- Modify: `package.json`

**Step 1: Install expo-google-fonts packages**

Run:
```bash
npx expo install @expo-google-fonts/quicksand @expo-google-fonts/outfit
```

Expected: Packages added to package.json dependencies

**Step 2: Verify installation**

Run:
```bash
cat package.json | grep -E "(quicksand|outfit)"
```

Expected: Both packages listed in dependencies

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install expo-google-fonts for Quicksand and Outfit"
```

---

## Task 2: Update Tailwind Config

**Files:**
- Modify: `tailwind.config.js`

**Step 1: Replace tailwind.config.js with new design tokens**

Replace entire file with:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#9DBEBB',
        secondary: '#F4ACB7',
        accent: '#FFE5D9',
        'background-light': '#F9FBFA',
        'background-dark': '#121414',
      },
      fontFamily: {
        display: ['Quicksand_400Regular', 'Quicksand_500Medium', 'Quicksand_600SemiBold', 'Quicksand_700Bold'],
        body: ['Outfit_300Light', 'Outfit_400Regular', 'Outfit_500Medium', 'Outfit_600SemiBold'],
      },
      borderRadius: {
        DEFAULT: '24px',
        xl: '32px',
        '2xl': '40px',
      },
      boxShadow: {
        soft: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
```

**Step 2: Verify config syntax**

Run:
```bash
npx tailwindcss --help > /dev/null && echo "Config OK"
```

Expected: "Config OK" (no syntax errors)

**Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: update Tailwind config with new design tokens"
```

---

## Task 3: Update Colors Constants

**Files:**
- Modify: `constants/Colors.ts`

**Step 1: Update Colors.ts with new palette**

Replace entire file with:

```ts
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
```

**Step 2: Commit**

```bash
git add constants/Colors.ts
git commit -m "feat: update Colors constants with new palette"
```

---

## Task 4: Update Root Layout with Font Loading

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Update _layout.tsx to load new fonts**

Replace the file with:

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, dbReady]);

  useEffect(() => {
    if (!loaded) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const { runMigrations } = await import('@/db/migrations');
        runMigrations();

        const { IAPService } = await import('@/services/iapService');
        await IAPService.initialize();
        await IAPService.getProducts();
      } catch (e) {
        console.error('Bootstrap failed:', e);
      } finally {
        if (!cancelled) {
          setDbReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loaded]);

  if (!loaded || !dbReady) {
    return <View style={{ flex: 1, backgroundColor: '#F9FBFA' }} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', headerShown: false, contentStyle: { backgroundColor: '#F9FBFA' } }}
        />
      </Stack>
    </ThemeProvider>
  );
}
```

**Step 2: Verify app starts**

Run:
```bash
npx expo start --ios
```

Expected: App loads without font errors, splash screen shows then hides

**Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: load Quicksand and Outfit fonts in root layout"
```

---

## Task 5: Create UI Components Directory

**Files:**
- Create: `components/ui/index.ts`

**Step 1: Create the ui directory and barrel export**

Create `components/ui/index.ts`:

```ts
// Typography
export { Heading } from './Heading';
export { Body } from './Body';
export { Caption } from './Caption';

// Buttons
export { PrimaryButton } from './PrimaryButton';
export { SecondaryButton } from './SecondaryButton';
export { IconButton } from './IconButton';

// Cards
export { QuiltCard } from './QuiltCard';
export { QuiltGrid } from './QuiltGrid';

// Inputs
export { TextInput } from './TextInput';
```

**Step 2: Commit**

```bash
git add components/ui/index.ts
git commit -m "feat: create ui components barrel export"
```

---

## Task 6: Create Heading Component

**Files:**
- Create: `components/ui/Heading.tsx`
- Create: `components/ui/__tests__/Heading.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/Heading.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders children text', () => {
    const { getByText } = render(<Heading>Hello World</Heading>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies size 1 styles', () => {
    const { getByText } = render(<Heading size={1}>Title</Heading>);
    const element = getByText('Title');
    expect(element.props.className).toContain('text-3xl');
  });

  it('applies size 4 styles', () => {
    const { getByText } = render(<Heading size={4}>Small</Heading>);
    const element = getByText('Small');
    expect(element.props.className).toContain('text-base');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/Heading.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../Heading'

**Step 3: Create the Heading component**

Create `components/ui/Heading.tsx`:

```tsx
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/Heading.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/Heading.tsx components/ui/__tests__/Heading.test.tsx
git commit -m "feat: add Heading typography component"
```

---

## Task 7: Create Body Component

**Files:**
- Create: `components/ui/Body.tsx`
- Create: `components/ui/__tests__/Body.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/Body.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Body } from '../Body';

describe('Body', () => {
  it('renders children text', () => {
    const { getByText } = render(<Body>Hello World</Body>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies muted styles when muted prop is true', () => {
    const { getByText } = render(<Body muted>Muted text</Body>);
    const element = getByText('Muted text');
    expect(element.props.className).toContain('opacity-60');
  });

  it('applies size sm styles', () => {
    const { getByText } = render(<Body size="sm">Small</Body>);
    const element = getByText('Small');
    expect(element.props.className).toContain('text-sm');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/Body.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../Body'

**Step 3: Create the Body component**

Create `components/ui/Body.tsx`:

```tsx
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/Body.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/Body.tsx components/ui/__tests__/Body.test.tsx
git commit -m "feat: add Body typography component"
```

---

## Task 8: Create Caption Component

**Files:**
- Create: `components/ui/Caption.tsx`
- Create: `components/ui/__tests__/Caption.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/Caption.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Caption } from '../Caption';

describe('Caption', () => {
  it('renders children text', () => {
    const { getByText } = render(<Caption>Label</Caption>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('applies uppercase styles when uppercase prop is true', () => {
    const { getByText } = render(<Caption uppercase>Label</Caption>);
    const element = getByText('Label');
    expect(element.props.className).toContain('uppercase');
    expect(element.props.className).toContain('tracking-widest');
  });

  it('applies muted styles by default', () => {
    const { getByText } = render(<Caption>Label</Caption>);
    const element = getByText('Label');
    expect(element.props.className).toContain('opacity-50');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/Caption.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../Caption'

**Step 3: Create the Caption component**

Create `components/ui/Caption.tsx`:

```tsx
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/Caption.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/Caption.tsx components/ui/__tests__/Caption.test.tsx
git commit -m "feat: add Caption typography component"
```

---

## Task 9: Create PrimaryButton Component

**Files:**
- Create: `components/ui/PrimaryButton.tsx`
- Create: `components/ui/__tests__/PrimaryButton.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/PrimaryButton.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('renders label text', () => {
    const { getByText } = render(<PrimaryButton label="Press me" onPress={() => {}} />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton label="Press me" onPress={onPress} />);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton label="Press me" onPress={onPress} disabled />);
    fireEvent.press(getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/PrimaryButton.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../PrimaryButton'

**Step 3: Create the PrimaryButton component**

Create `components/ui/PrimaryButton.tsx`:

```tsx
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function PrimaryButton({
  label,
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'bg-primary rounded-full py-4 px-6 flex-row items-center justify-center',
        'shadow-lg shadow-primary/30',
        'active:scale-[0.98]',
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <ActivityIndicator color="#1f2937" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="font-body font-bold text-slate-900 text-base">
            {label}
          </Text>
          {icon && (
            <MaterialIcons name={icon} size={20} color="#1f2937" />
          )}
        </View>
      )}
    </Pressable>
  );
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/PrimaryButton.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/PrimaryButton.tsx components/ui/__tests__/PrimaryButton.test.tsx
git commit -m "feat: add PrimaryButton component"
```

---

## Task 10: Create SecondaryButton Component

**Files:**
- Create: `components/ui/SecondaryButton.tsx`
- Create: `components/ui/__tests__/SecondaryButton.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/SecondaryButton.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SecondaryButton } from '../SecondaryButton';

describe('SecondaryButton', () => {
  it('renders label text', () => {
    const { getByText } = render(<SecondaryButton label="Skip" onPress={() => {}} />);
    expect(getByText('Skip')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<SecondaryButton label="Skip" onPress={onPress} />);
    fireEvent.press(getByText('Skip'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/SecondaryButton.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../SecondaryButton'

**Step 3: Create the SecondaryButton component**

Create `components/ui/SecondaryButton.tsx`:

```tsx
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SecondaryButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function SecondaryButton({
  label,
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'bg-slate-100 dark:bg-slate-800 rounded-full py-4 px-6 flex-row items-center justify-center',
        'active:scale-[0.98]',
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <ActivityIndicator color="#64748b" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="font-body font-semibold text-slate-500 dark:text-slate-400 text-base">
            {label}
          </Text>
          {icon && (
            <MaterialIcons name={icon} size={20} color="#64748b" />
          )}
        </View>
      )}
    </Pressable>
  );
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/SecondaryButton.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/SecondaryButton.tsx components/ui/__tests__/SecondaryButton.test.tsx
git commit -m "feat: add SecondaryButton component"
```

---

## Task 11: Create IconButton Component

**Files:**
- Create: `components/ui/IconButton.tsx`
- Create: `components/ui/__tests__/IconButton.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/IconButton.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';

describe('IconButton', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon="arrow-back" onPress={onPress} testID="icon-btn" />
    );
    fireEvent.press(getByTestId('icon-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon="arrow-back" onPress={onPress} disabled testID="icon-btn" />
    );
    fireEvent.press(getByTestId('icon-btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/IconButton.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../IconButton'

**Step 3: Create the IconButton component**

Create `components/ui/IconButton.tsx`:

```tsx
import { Pressable, PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'muted';

interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: keyof typeof MaterialIcons.glyphMap;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  onPress: () => void;
}

const sizeConfig: Record<IconButtonSize, { container: string; icon: number }> = {
  sm: { container: 'w-10 h-10', icon: 20 },
  md: { container: 'w-12 h-12', icon: 24 },
  lg: { container: 'w-14 h-14', icon: 28 },
};

const variantConfig: Record<IconButtonVariant, { container: string; iconColor: string }> = {
  default: {
    container: 'bg-white dark:bg-slate-800 shadow-soft border border-slate-100 dark:border-slate-700',
    iconColor: '#64748b',
  },
  primary: {
    container: 'bg-primary shadow-lg shadow-primary/30',
    iconColor: '#ffffff',
  },
  muted: {
    container: 'bg-slate-100 dark:bg-slate-800',
    iconColor: '#9ca3af',
  },
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  disabled = false,
  onPress,
  ...props
}: IconButtonProps) {
  const { container: sizeClass, icon: iconSize } = sizeConfig[size];
  const { container: variantClass, iconColor } = variantConfig[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'rounded-full items-center justify-center',
        'active:scale-95',
        sizeClass,
        variantClass,
        disabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <MaterialIcons name={icon} size={iconSize} color={iconColor} />
    </Pressable>
  );
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/IconButton.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/IconButton.tsx components/ui/__tests__/IconButton.test.tsx
git commit -m "feat: add IconButton component"
```

---

## Task 12: Create QuiltCard Component

**Files:**
- Create: `components/ui/QuiltCard.tsx`
- Create: `components/ui/__tests__/QuiltCard.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/QuiltCard.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QuiltCard } from '../QuiltCard';

describe('QuiltCard', () => {
  it('renders children', () => {
    const { getByText } = render(
      <QuiltCard>
        <Text>Card content</Text>
      </QuiltCard>
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  it('calls onPress when pressable and pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <QuiltCard pressable onPress={onPress}>
        <Text>Pressable card</Text>
      </QuiltCard>
    );
    fireEvent.press(getByText('Pressable card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles', () => {
    const { getByTestId } = render(
      <QuiltCard variant="primary" testID="card">
        <Text>Primary card</Text>
      </QuiltCard>
    );
    const card = getByTestId('card');
    expect(card.props.className).toContain('bg-primary/15');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/QuiltCard.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../QuiltCard'

**Step 3: Create the QuiltCard component**

Create `components/ui/QuiltCard.tsx`:

```tsx
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
  neutral: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700',
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/QuiltCard.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/QuiltCard.tsx components/ui/__tests__/QuiltCard.test.tsx
git commit -m "feat: add QuiltCard component"
```

---

## Task 13: Create QuiltGrid Component

**Files:**
- Create: `components/ui/QuiltGrid.tsx`
- Create: `components/ui/__tests__/QuiltGrid.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/QuiltGrid.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QuiltGrid } from '../QuiltGrid';

describe('QuiltGrid', () => {
  it('renders children', () => {
    const { getByText } = render(
      <QuiltGrid>
        <Text>Child 1</Text>
        <Text>Child 2</Text>
      </QuiltGrid>
    );
    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/QuiltGrid.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../QuiltGrid'

**Step 3: Create the QuiltGrid component**

Create `components/ui/QuiltGrid.tsx`:

```tsx
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
```

Note: React Native doesn't support CSS Grid natively. We use flexbox with `flex-wrap`. For true 2-column grid behavior, each card should have `w-[calc(50%-6px)]` or similar width constraint. This can be handled by the parent or by a style prop on QuiltCard.

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/QuiltGrid.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/QuiltGrid.tsx components/ui/__tests__/QuiltGrid.test.tsx
git commit -m "feat: add QuiltGrid component"
```

---

## Task 14: Create TextInput Component

**Files:**
- Create: `components/ui/TextInput.tsx`
- Create: `components/ui/__tests__/TextInput.test.tsx`

**Step 1: Write the test**

Create `components/ui/__tests__/TextInput.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Enter name" />
    );
    expect(getByPlaceholderText('Enter name')).toBeTruthy();
  });

  it('renders label when provided', () => {
    const { getByText } = render(
      <TextInput label="Name" placeholder="Enter name" />
    );
    expect(getByText('Name')).toBeTruthy();
  });

  it('renders error message when provided', () => {
    const { getByText } = render(
      <TextInput error="This field is required" placeholder="Enter name" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Enter name" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Enter name'), 'John');
    expect(onChangeText).toHaveBeenCalledWith('John');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx jest components/ui/__tests__/TextInput.test.tsx --no-cache
```

Expected: FAIL - Cannot find module '../TextInput'

**Step 3: Create the TextInput component**

Create `components/ui/TextInput.tsx`:

```tsx
import { View, TextInput as RNTextInput, TextInputProps as RNTextInputProps, Text } from 'react-native';
import { useState } from 'react';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function TextInput({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputClasses = [
    'bg-slate-50 dark:bg-slate-800/50',
    'rounded-2xl py-5 px-6',
    'text-xl font-medium',
    'text-slate-900 dark:text-slate-100',
    isFocused && !error && 'ring-2 ring-primary',
    error && 'ring-2 ring-red-500',
    className,
  ].filter(Boolean).join(' ');

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-slate-400 uppercase tracking-widest ml-1 mb-4">
          {label}
        </Text>
      )}
      <RNTextInput
        className={inputClasses}
        placeholderTextColor="#cbd5e1"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-2 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npx jest components/ui/__tests__/TextInput.test.tsx --no-cache
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/TextInput.tsx components/ui/__tests__/TextInput.test.tsx
git commit -m "feat: add TextInput component"
```

---

## Task 15: Run All Tests and Final Commit

**Step 1: Run all UI component tests**

Run:
```bash
npx jest components/ui/__tests__/ --no-cache
```

Expected: All tests PASS

**Step 2: Verify app builds**

Run:
```bash
npx expo start --ios
```

Expected: App starts without errors

**Step 3: Final commit for barrel export**

```bash
git add components/ui/index.ts
git commit -m "feat: complete UI foundation component library"
```

---

## Summary

After completing all tasks, you will have:

1. **Tailwind config** with new color palette and font families
2. **Font loading** for Quicksand and Outfit via expo-google-fonts
3. **Typography components**: `Heading`, `Body`, `Caption`
4. **Button components**: `PrimaryButton`, `SecondaryButton`, `IconButton`
5. **Card components**: `QuiltCard`, `QuiltGrid`
6. **Input component**: `TextInput`

All components are tested and can be imported from `@/components/ui`.
