import { useEffect, useState } from 'react';

import { useChangeVersion } from '@/shared/hooks/useChangeVersion';
import type { ListState } from '@/shared/types/ListState';
import { toError } from '@/shared/utils/toError';

import type { CustomerListFilter } from '../data/customerRepository';
import type { Customer } from '../domain/customer';
import { useCustomerRepository } from './useCustomerRepository';

/**
 * Customers matching the filter, read from the local database. Re-reads whenever the
 * repository reports a change, so adds, edits, deletes and syncs show up without a manual
 * refresh. `'loading'` only appears before the first result; later reloads keep the current list.
 */
export function useCustomers({ role, search }: CustomerListFilter): ListState<Customer> {
  const repository = useCustomerRepository();
  const version = useChangeVersion(repository.subscribe);
  const [state, setState] = useState<ListState<Customer>>('loading');

  useEffect(() => {
    // Set by cleanup when the filter or data changes again, so stale results are ignored.
    let cancelled = false;

    repository.list({ role, search }).then(
      (customers) => {
        if (!cancelled) setState(customers);
      },
      (error: unknown) => {
        if (!cancelled) setState(toError(error));
      },
    );

    return () => {
      cancelled = true;
    };
  }, [repository, role, search, version]);

  return state;
}
