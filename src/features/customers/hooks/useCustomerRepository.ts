import { useCustomersDependencies } from '../data/CustomersContext';

/** The customer repository. Must be used inside `CustomersProvider`. */
export function useCustomerRepository() {
  return useCustomersDependencies().repository;
}
