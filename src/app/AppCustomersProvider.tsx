import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, type PropsWithChildren } from 'react';

import { graphqlClient } from '@/core/graphql/client';
import { fetchCustomerPage } from '@/features/customers/api/listZellerCustomers';
import CustomersProvider from '@/features/customers/data/CustomersProvider';
import { createCustomerRepository } from '@/features/customers/data/customerRepository';
import type { FetchCustomerPage } from '@/features/customers/data/syncService';

const fetchPage: FetchCustomerPage = (nextToken) => fetchCustomerPage(graphqlClient, nextToken);

/** Wires the customers feature to the real implementations: SQLite and the GraphQL API. */
function AppCustomersProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const repository = useMemo(() => createCustomerRepository(db), [db]);

  return (
    <CustomersProvider repository={repository} fetchPage={fetchPage}>
      {children}
    </CustomersProvider>
  );
}

export default AppCustomersProvider;
