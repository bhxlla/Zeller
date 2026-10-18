import { useEffect, useState } from 'react';

/** Subscribes to changes; returns a function that unsubscribes. */
export type Subscribe = (onChange: () => void) => () => void;

/** Changes often arrive in bursts (e.g. one per row during a sync); a burst is one bump. */
const BATCH_DELAY_MS = 50;

/**
 * A number that increases whenever `subscribe` reports a change. Use it as an effect dependency
 * to re-read data. `subscribe` must be stable, or the subscription restarts on every render.
 */
export function useChangeVersion(subscribe: Subscribe): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setVersion((current) => current + 1), BATCH_DELAY_MS);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [subscribe]);

  return version;
}
