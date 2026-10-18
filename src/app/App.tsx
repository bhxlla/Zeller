import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DatabaseProvider from '@/core/db/DatabaseProvider';

import AppCustomersProvider from './AppCustomersProvider';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AppCustomersProvider>
          <RootNavigator />
        </AppCustomersProvider>
        <StatusBar style="dark" />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
