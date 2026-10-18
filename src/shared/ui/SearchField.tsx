import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

import IconButton from './IconButton';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called by the close button: the caller clears the text and hides the field. */
  onClose: () => void;
  placeholder: string;
};

/** A pill-shaped search input that focuses when shown, with a close button. */
function SearchField({ value, onChangeText, onClose, placeholder }: Props) {
  return (
    <View style={styles.field}>
      <MaterialIcons name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={placeholder}
      />
      <IconButton icon="close" accessibilityLabel="Close search" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.tabHeight,
    paddingLeft: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: 0,
    color: colors.textPrimary,
  },
});

export default SearchField;
