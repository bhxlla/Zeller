import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  CustomerList: undefined;
  /** No `customerId` creates a new customer; with one, edits that customer. */
  CustomerForm: { customerId?: string } | undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

// Types `useNavigation()` app-wide without passing the param list each time.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
