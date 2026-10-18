import { useCallback, useEffect, useMemo, useState } from 'react';

import { graphqlClient } from '@/core/graphql/client';
import { toError } from '@/shared/utils/toError';

import { fetchCustomerPage } from '../api/listZellerCustomers';
import { createCustomerSync } from '../data/syncService';
import { useCustomerRepository } from './useCustomerRepository';

/** `Error` is the last sync's failure; local data stays usable, and the next sync retries. */
export type SyncStatus = 'idle' | 'syncing' | Error;

type CustomerSync = {
  /** Fetches customers from the API into the local database. Never throws: see `status`. */
  refresh: () => Promise<void>;
  status: SyncStatus;
};

/** Syncs customers once on mount, and exposes `refresh` for pull-to-refresh. */
export function useCustomerSync(): CustomerSync {
  const repository = useCustomerRepository();
  const syncCustomers = useMemo(
    () =>
      createCustomerSync({
        fetchPage: (nextToken) => fetchCustomerPage(graphqlClient, nextToken),
        repository,
      }),
    [repository],
  );

  const [status, setStatus] = useState<SyncStatus>('idle');

  const refresh = useCallback(async () => {
    setStatus('syncing');
    try {
      await syncCustomers();
      setStatus('idle');
    } catch (caught) {
      setStatus(toError(caught));
    }
  }, [syncCustomers]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refresh, status };
}
