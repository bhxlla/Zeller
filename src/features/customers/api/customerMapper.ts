import { ROLES, type Customer, type Role } from '../domain/customer';
import type { ApiZellerCustomer } from './listZellerCustomers';

const blankToNull = (value: string | null) => value?.trim() || null;

/** Matches a known role ignoring case and whitespace; anything else means "no role". */
function toRole(value: string | null): Role | null {
  const normalised = value?.trim().toLowerCase();
  return ROLES.find((role) => role.toLowerCase() === normalised) ?? null;
}

/**
 * Converts an API customer into a domain `Customer`, or `null` if it can't be shown.
 * Only a missing name drops a customer; an unknown role keeps them, visible under "All".
 */
export function toCustomer(api: ApiZellerCustomer): Customer | null {
  const name = blankToNull(api.name);
  if (!name) return null;

  return {
    id: api.id,
    name,
    email: blankToNull(api.email),
    role: toRole(api.role),
  };
}
