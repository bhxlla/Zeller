export const ROLES = ['Admin', 'Manager'] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string | null): value is Role {
  return ROLES.includes(value as Role);
}

/** List filters: every customer, or one role. Order matches the tabs. */
export const ROLE_FILTERS = ['All', ...ROLES] as const;

export type RoleFilter = (typeof ROLE_FILTERS)[number];

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  /** `null` when the API sent a role we don't recognise: the customer shows under "All" only. */
  role: Role | null;
};
