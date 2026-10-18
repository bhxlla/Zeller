import { useCallback, useEffect, useMemo, useState } from 'react';

import { toError } from '@/shared/utils/toError';

import { useCustomersDependencies } from '../data/CustomersContext';
import { createCustomerSync } from '../data/syncService';

/** `Error` is the last sync's failure; local data stays usable, and the next sync retries. */
export type SyncStatus = 'idle' | 'syncing' | Error;

type CustomerSync = {
  /** Fetches customers from the API into the local database. Never throws: see `status`. */
  refresh: () => Promise<void>;
  status: SyncStatus;
};

/** Syncs customers once on mount, and exposes `refresh` for pull-to-refresh. */
export function useCustomerSync(): CustomerSync {
  const { repository, fetchPage } = useCustomersDependencies();
  const syncCustomers = useMemo(
    () => createCustomerSync({ fetchPage, repository }),
    [fetchPage, repository],
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
