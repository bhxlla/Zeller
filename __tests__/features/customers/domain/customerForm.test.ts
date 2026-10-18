import type { Customer } from '@/features/customers/domain/customer';
import {
  EMPTY_CUSTOMER_FORM,
  toFormValues,
  toNewCustomer,
  validateCustomerForm,
  type CustomerFormValues,
} from '@/features/customers/domain/customerForm';

const validForm: CustomerFormValues = {
  firstName: 'Brad',
  lastName: 'Herman',
  email: 'brad@zeller.com',
  role: 'Manager',
};

const customer = (overrides: Partial<Customer> = {}): Customer => ({
  id: '1',
  name: 'Cecil Boyle IV',
  email: 'cecil@zeller.com',
  role: 'Admin',
  ...overrides,
});

describe('toFormValues', () => {
  it('splits the name at the first space', () => {
    expect(toFormValues(customer())).toEqual({
      firstName: 'Cecil',
      lastName: 'Boyle IV',
      email: 'cecil@zeller.com',
      role: 'Admin',
    });
  });

  it('puts a single-word name in the first name', () => {
    expect(toFormValues(customer({ name: 'TestCustomer1' }))).toMatchObject({
      firstName: 'TestCustomer1',
      lastName: '',
    });
  });

  it('shows no email and no role as empty', () => {
    expect(toFormValues(customer({ email: null, role: null }))).toMatchObject({
      email: '',
      role: null,
    });
  });
});

describe('validateCustomerForm', () => {
  it('accepts a valid form', () => {
    expect(validateCustomerForm(validForm)).toEqual({});
  });

  it('accepts a form without last name or email', () => {
    expect(validateCustomerForm({ ...validForm, lastName: '', email: '' })).toEqual({});
  });

  it('reports every problem in an empty form', () => {
    expect(validateCustomerForm(EMPTY_CUSTOMER_FORM)).toEqual({
      firstName: 'Required',
      role: 'Choose a role',
    });
  });

  it('reports invalid characters and email per field', () => {
    expect(
      validateCustomerForm({ ...validForm, firstName: 'Brad1', lastName: 'O-Neil', email: 'x@' }),
    ).toEqual({
      firstName: 'Only letters and spaces are allowed',
      lastName: 'Only letters and spaces are allowed',
      email: 'Enter a valid email address',
    });
  });

  it('flags an API name that breaks the rules when it is edited', () => {
    expect(validateCustomerForm(toFormValues(customer({ name: 'TestCustomer1' })))).toEqual({
      firstName: 'Only letters and spaces are allowed',
    });
  });

  it('shows the 50-character limit under the last name when there is one', () => {
    const errors = validateCustomerForm({
      ...validForm,
      firstName: 'a'.repeat(25),
      lastName: 'b'.repeat(25),
    });
    expect(errors).toEqual({ lastName: 'Name must be 50 characters or fewer' });
  });

  it('shows the 50-character limit under the first name when there is no last name', () => {
    const errors = validateCustomerForm({ ...validForm, firstName: 'a'.repeat(51), lastName: '' });
    expect(errors).toEqual({ firstName: 'Name must be 50 characters or fewer' });
  });
});

describe('toNewCustomer', () => {
  it('builds the customer to save, trimmed', () => {
    expect(
      toNewCustomer({
        firstName: ' Brad ',
        lastName: ' Herman ',
        email: ' b@z.com ',
        role: 'Admin',
      }),
    ).toEqual({ name: 'Brad Herman', email: 'b@z.com', role: 'Admin' });
  });

  it('saves a blank email as no email', () => {
    expect(toNewCustomer({ ...validForm, email: '  ' })?.email).toBeNull();
  });

  it('returns null when the form is invalid', () => {
    expect(toNewCustomer({ ...validForm, role: null })).toBeNull();
  });
});
