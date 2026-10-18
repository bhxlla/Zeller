import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type ComponentProps, useCallback } from 'react';
import { Pressable, type PressableStateCallbackType, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, sizes, spacing } from '@/shared/theme';

type Props = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  /** Read by screen readers, since the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
};

/** Floating action button, pinned to the bottom-right corner above the home indicator. */
export function Fab({ icon, accessibilityLabel, onPress }: Props) {
  const { bottom } = useSafeAreaInsets();
  const fabStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.fab,
      { bottom: bottom + spacing.lg },
      pressed && styles.pressed,
    ],
    [bottom],
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={fabStyle}
    >
      <MaterialIcons name={icon} size={32} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: sizes.fab,
    height: sizes.fab,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
