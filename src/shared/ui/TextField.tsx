import type { Ref } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

type Props = Omit<TextInputProps, 'style' | 'placeholder'> & {
  /** Lets the screen move focus here, e.g. from the previous field's "next" key. */
  ref?: Ref<TextInput>;
  /** Shown as the placeholder and read by screen readers, like the design's field labels. */
  label: string;
  /** Shown under the field, which turns red. */
  error?: string;
};

/** An underlined text input with an optional error message below it. */
function TextField({ label, error, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        {...inputProps}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        accessibilityHint={error}
        style={error ? styles.inputWithError : styles.input}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const input = {
  ...typography.body,
  color: colors.textPrimary,
  paddingVertical: spacing.md,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: colors.divider,
} as const;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  input,
  inputWithError: {
    ...input,
    borderBottomColor: colors.danger,
  },
  error: {
    ...typography.label,
    color: colors.danger,
  },
});

export default TextField;
