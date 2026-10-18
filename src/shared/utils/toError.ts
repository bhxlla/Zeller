/** Normalises a caught value (which can be anything in JS) into an `Error`. */
export const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));
