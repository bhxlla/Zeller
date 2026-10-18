import type { Customer, NewCustomer, Role } from './customer';
import {
  toFullName,
  validateEmail,
  validateFirstName,
  validateFullNameLength,
  validateLastName,
} from './validation';

/** What the form edits. Strings are kept as typed; trimming happens on save. */
export type CustomerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  /** `null` until chosen: new customers, or API customers without a known role. */
  role: Role | null;
};

export type CustomerFormField = keyof CustomerFormValues;

export type CustomerFormErrors = Partial<Record<CustomerFormField, string>>;

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: null,
};

/** Splits a stored name at its first space: "Cecil Boyle IV" → "Cecil" + "Boyle IV". */
export function toFormValues(customer: Customer): CustomerFormValues {
  const name = customer.name.trim();
  const firstSpace = name.indexOf(' ');
  return {
    firstName: firstSpace === -1 ? name : name.slice(0, firstSpace),
    lastName: firstSpace === -1 ? '' : name.slice(firstSpace + 1).trim(),
    email: customer.email ?? '',
    role: customer.role,
  };
}

/** Every field's error, if any. An empty object means the form can be saved. */
export function validateCustomerForm(values: CustomerFormValues): CustomerFormErrors {
  const errors: CustomerFormErrors = {};

  const firstName = validateFirstName(values.firstName);
  const lastName = validateLastName(values.lastName);
  if (firstName) errors.firstName = firstName;
  if (lastName) errors.lastName = lastName;

  // The 50-character limit is on the stored full name; show it under the last field filled in.
  if (!firstName && !lastName) {
    const length = validateFullNameLength(values.firstName, values.lastName);
    if (length) errors[values.lastName.trim() ? 'lastName' : 'firstName'] = length;
  }

  const email = validateEmail(values.email);
  if (email) errors.email = email;

  if (!values.role) errors.role = 'Choose a role';

  return errors;
}

/** The customer to save, or `null` if the form has errors. */
export function toNewCustomer(values: CustomerFormValues): NewCustomer | null {
  if (Object.keys(validateCustomerForm(values)).length > 0 || !values.role) return null;
  return {
    name: toFullName(values.firstName, values.lastName),
    email: values.email.trim() || null,
    role: values.role,
  };
}
