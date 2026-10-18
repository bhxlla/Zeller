import { render } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import RootNavigator from '@/app/navigation/RootNavigator';
import type { ApiZellerCustomer } from '@/features/customers/api/listZellerCustomers';
import CustomersProvider from '@/features/customers/data/CustomersProvider';
import type { FetchCustomerPage } from '@/features/customers/data/syncService';
import type { Customer } from '@/features/customers/domain/customer';

import { createFakeCustomerRepository } from './fakeCustomerRepository';

// Without initial metrics, SafeAreaProvider renders nothing until a native layout event.
const SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

type RenderAppOptions = {
  /** Customers already saved on the device when the app starts. */
  stored?: readonly Customer[];
  /** What the API returns on every sync, or an Error to make every sync fail. */
  server?: readonly ApiZellerCustomer[] | Error;
};

/**
 * Renders the whole app (real navigation, screens and hooks) on an in-memory repository and a
 * fake API. Returns both so tests can inspect what was saved or change what the server returns.
 */
export async function renderApp({ stored = [], server = [] }: RenderAppOptions = {}) {
  const repository = createFakeCustomerRepository(stored);
  const fetchPage = jest.fn<ReturnType<FetchCustomerPage>, Parameters<FetchCustomerPage>>(
    async () => {
      if (server instanceof Error) throw server;
      return { items: [...server], nextToken: null };
    },
  );

  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <CustomersProvider repository={repository} fetchPage={fetchPage}>
        <RootNavigator />
      </CustomersProvider>
    </SafeAreaProvider>,
  );

  return { repository, fetchPage };
}
