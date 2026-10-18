import { memo, useCallback } from 'react';
import { Pressable, type PressableStateCallbackType, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

import type { Customer } from '../domain/customer';
import { initialOf } from '../domain/sections';

type Props = {
  customer: Customer;
  onPress: (customer: Customer) => void;
};

/** A list row: initial avatar, name, and an "Admin" label (managers show none, per the design). */
function CustomerRow({ customer, onPress }: Props) {
  const handlePress = useCallback(() => onPress(customer), [onPress, customer]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={customer.role === 'Admin' ? `${customer.name}, Admin` : customer.name}
      style={rowStyle}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initialOf(customer.name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {customer.name}
      </Text>
      {customer.role === 'Admin' && <Text style={styles.role}>Admin</Text>}
    </Pressable>
  );
}

export default memo(CustomerRow);

const rowStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.row,
  pressed && styles.pressed,
];

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.rowHeight,
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  pressed: {
    opacity: 0.6,
  },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.body,
    color: colors.primary,
  },
  name: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  role: {
    ...typography.label,
    color: colors.textMuted,
  },
});
