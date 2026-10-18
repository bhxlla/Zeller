import { createContext, useContext } from 'react';

import type { CustomerRepository } from './customerRepository';
import type { FetchCustomerPage } from './syncService';

/**
 * What the customers feature needs from the outside world: where customers are stored, and how
 * to fetch them from the API. The app passes SQLite and Apollo; tests pass in-memory fakes.
 */
export type CustomersDependencies = {
  repository: CustomerRepository;
  fetchPage: FetchCustomerPage;
};

export const CustomersContext = createContext<CustomersDependencies | null>(null);

/** The feature's dependencies. Must be used inside `CustomersProvider`. */
export function useCustomersDependencies(): CustomersDependencies {
  const dependencies = useContext(CustomersContext);
  if (!dependencies) {
    throw new Error('useCustomersDependencies must be used inside CustomersProvider');
  }
  return dependencies;
}
