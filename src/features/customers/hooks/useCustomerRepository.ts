import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { createCustomerRepository } from '../data/customerRepository';

/** The customer repository for the app's database. Must be used inside `DatabaseProvider`. */
export function useCustomerRepository() {
  const db = useSQLiteContext();
  return useMemo(() => createCustomerRepository(db), [db]);
}
