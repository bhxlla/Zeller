import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect, useState } from 'react';

/** Change events arrive once per row; a burst (e.g. a sync) is batched into one bump. */
const BATCH_DELAY_MS = 50;

/**
 * A number that increases whenever rows in `tableName` change. Use it as an effect dependency
 * to re-read data after inserts, updates and deletes. Requires `enableChangeListener`.
 */
export function useTableVersion(tableName: string): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const subscription = addDatabaseChangeListener((event) => {
      if (event.tableName !== tableName) return;
      clearTimeout(timer);
      timer = setTimeout(() => setVersion((current) => current + 1), BATCH_DELAY_MS);
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [tableName]);

  return version;
}
