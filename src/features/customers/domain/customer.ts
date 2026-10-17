export const ROLES = ['Admin', 'Manager'] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string | null): value is Role {
  return ROLES.includes(value as Role);
}

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  role: Role;
};
