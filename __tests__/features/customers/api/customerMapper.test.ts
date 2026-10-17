import { toCustomer } from '@/features/customers/api/customerMapper';
import type { ApiZellerCustomer } from '@/features/customers/api/listZellerCustomers';

const apiCustomer = (overrides: Partial<ApiZellerCustomer> = {}): ApiZellerCustomer => ({
  id: '1',
  name: 'TestCustomer1',
  email: 'test1@test.com',
  role: 'Manager',
  ...overrides,
});

describe('toCustomer', () => {
  it('maps a complete API customer', () => {
    expect(toCustomer(apiCustomer())).toEqual({
      id: '1',
      name: 'TestCustomer1',
      email: 'test1@test.com',
      role: 'Manager',
    });
  });

  it.each([null, '', '   '])('skips a customer without a name (%p)', (name) => {
    expect(toCustomer(apiCustomer({ name }))).toBeNull();
  });

  it('keeps names that would fail form validation', () => {
    expect(toCustomer(apiCustomer({ name: 'Cust0mer #1' }))?.name).toBe('Cust0mer #1');
  });

  it('trims the name and email', () => {
    const customer = toCustomer(
      apiCustomer({ name: '  Brad Herman ', email: ' brad@zeller.com ' }),
    );
    expect(customer).toMatchObject({ name: 'Brad Herman', email: 'brad@zeller.com' });
  });

  it.each([null, '', '  '])('treats a blank email as no email (%p)', (email) => {
    expect(toCustomer(apiCustomer({ email }))?.email).toBeNull();
  });

  it.each([
    ['admin', 'Admin'],
    [' MANAGER ', 'Manager'],
  ])('matches role %p ignoring case and whitespace', (role, expected) => {
    expect(toCustomer(apiCustomer({ role }))?.role).toBe(expected);
  });

  it.each([null, '', 'Owner'])('keeps a customer with unknown role %p, with no role', (role) => {
    const customer = toCustomer(apiCustomer({ role }));
    expect(customer).not.toBeNull();
    expect(customer?.role).toBeNull();
  });
});
