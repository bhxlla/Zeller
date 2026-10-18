import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation/types';
import { colors, spacing, typography } from '@/shared/theme';
import Button from '@/shared/ui/Button';
import IconButton from '@/shared/ui/IconButton';
import SegmentedControl from '@/shared/ui/SegmentedControl';
import TextField from '@/shared/ui/TextField';

import { ROLES } from '../domain/customer';
import { MAX_NAME_LENGTH } from '../domain/validation';
import { useCustomerForm } from '../hooks/useCustomerForm';

const SAFE_AREA_EDGES = ['top', 'bottom'] as const;
const KEYBOARD_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : 'height';

function CustomerFormScreen({ navigation, route }: RootStackScreenProps<'CustomerForm'>) {
  const { isEditing, values, errors, status, textFieldHandlers, setRole, save, remove } =
    useCustomerForm(route.params?.customerId);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const focusLastName = useCallback(() => lastNameRef.current?.focus(), []);
  const focusEmail = useCallback(() => emailRef.current?.focus(), []);

  const close = useCallback(() => navigation.goBack(), [navigation]);

  const submit = useCallback(async () => {
    if (await save()) navigation.goBack();
  }, [save, navigation]);

  const confirmDelete = useCallback(() => {
    Alert.alert('Delete user?', `${values.firstName} ${values.lastName}`.trim(), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (await remove()) navigation.goBack();
        },
      },
    ]);
  }, [values.firstName, values.lastName, remove, navigation]);

  const isSaving = status === 'saving';

  return (
    <SafeAreaView style={styles.screen} edges={SAFE_AREA_EDGES}>
      <View style={styles.header}>
        <IconButton icon="close" accessibilityLabel="Close" onPress={close} />
      </View>

      {status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : status === 'notFound' ? (
        <View style={styles.centered}>
          <Text style={styles.message}>This user no longer exists.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.screen} behavior={KEYBOARD_BEHAVIOR}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title} accessibilityRole="header">
              {isEditing ? 'Edit User' : 'New User'}
            </Text>

            {status instanceof Error ? (
              <Text style={styles.formError} accessibilityRole="alert">
                {"Couldn't save. Please try again."}
              </Text>
            ) : null}

            <TextField
              label="First Name"
              value={values.firstName}
              error={errors.firstName}
              {...textFieldHandlers.firstName}
              maxLength={MAX_NAME_LENGTH}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={focusLastName}
            />
            <TextField
              ref={lastNameRef}
              label="Last Name"
              value={values.lastName}
              error={errors.lastName}
              {...textFieldHandlers.lastName}
              maxLength={MAX_NAME_LENGTH}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={focusEmail}
            />
            <TextField
              ref={emailRef}
              label="Email"
              value={values.email}
              error={errors.email}
              {...textFieldHandlers.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
            />

            <View style={styles.role}>
              <Text style={styles.label}>User Role</Text>
              <SegmentedControl options={ROLES} value={values.role} onChange={setRole} />
              {errors.role ? <Text style={styles.fieldError}>{errors.role}</Text> : null}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={isEditing ? 'Save Changes' : 'Create User'}
              onPress={submit}
              loading={isSaving}
            />
            {isEditing ? (
              <Button title="Delete User" variant="danger" onPress={confirmDelete} />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    alignItems: 'flex-start',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  role: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  fieldError: {
    ...typography.label,
    color: colors.danger,
  },
  formError: {
    ...typography.label,
    color: colors.danger,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
  },
});

export default CustomerFormScreen;
