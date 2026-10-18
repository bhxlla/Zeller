import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, type PressableStateCallbackType, StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/theme';

type Props = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  /** Read by screen readers, since the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
};

/** A tappable icon with a comfortable touch area. */
function IconButton({ icon, accessibilityLabel, onPress, color = colors.primary }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={spacing.sm}
      style={buttonStyle}
    >
      <MaterialIcons name={icon} size={24} color={color} />
    </Pressable>
  );
}

const buttonStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.button,
  pressed && styles.pressed,
];

const styles = StyleSheet.create({
  button: {
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
});

export default IconButton;
