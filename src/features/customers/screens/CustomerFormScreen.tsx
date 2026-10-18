import { useCallback } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import type { RootStackScreenProps } from '@/app/navigation/types';

// Placeholder: proves the modal opens and receives its params. Replaced by the real form.
function CustomerFormScreen({ navigation, route }: RootStackScreenProps<'CustomerForm'>) {
  const customerId = route.params?.customerId;
  const close = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <View style={styles.container}>
      <Text>{customerId ? `Edit ${customerId}` : 'New User'}</Text>
      <Button title="Close" onPress={close} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});

export default CustomerFormScreen;
