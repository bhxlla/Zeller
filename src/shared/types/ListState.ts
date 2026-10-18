/**
 * The state of a list loaded asynchronously: still loading, loaded (possibly empty), or failed.
 * Check with `state === 'loading'`, `state instanceof Error`, or `Array.isArray(state)`.
 */
export type ListState<T> = T[] | 'loading' | Error;
