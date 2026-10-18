import {
  ActivityIndicator,
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

type Variant = 'primary' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  /** `primary`: filled blue pill. `danger`: red text, for destructive actions. */
  variant?: Variant;
  /** Shows a spinner and ignores presses, e.g. while saving. */
  loading?: boolean;
};

/** A full-width pill button. */
function Button({ title, onPress, variant = 'primary', loading = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={loading ? BUSY_STATE : IDLE_STATE}
      style={variantStyle[variant]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor[variant]} />
      ) : (
        <Text style={variant === 'primary' ? styles.primaryTitle : styles.dangerTitle}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const BUSY_STATE = { busy: true, disabled: true } as const;
const IDLE_STATE = { busy: false, disabled: false } as const;

const spinnerColor: Record<Variant, string> = {
  primary: colors.onPrimary,
  danger: colors.danger,
};

const variantStyle: Record<Variant, (state: PressableStateCallbackType) => StyleProp<ViewStyle>> = {
  primary: ({ pressed }) => [styles.base, styles.primary, pressed && styles.pressed],
  danger: ({ pressed }) => [styles.base, pressed && styles.pressed],
};

const styles = StyleSheet.create({
  base: {
    height: sizes.button,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  primaryTitle: {
    ...typography.body,
    color: colors.onPrimary,
  },
  dangerTitle: {
    ...typography.body,
    color: colors.danger,
  },
});

export default Button;
