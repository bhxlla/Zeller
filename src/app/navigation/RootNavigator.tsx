import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerFormScreen from '@/features/customers/screens/CustomerFormScreen';
import CustomerListScreen from '@/features/customers/screens/CustomerListScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Both screens draw their own headers, matching the designs.
const SCREEN_OPTIONS = { headerShown: false } as const;

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="CustomerList" component={CustomerListScreen} />
        <Stack.Screen name="CustomerForm" component={CustomerFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
