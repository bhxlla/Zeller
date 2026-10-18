import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DatabaseProvider from '@/core/db/DatabaseProvider';

import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
