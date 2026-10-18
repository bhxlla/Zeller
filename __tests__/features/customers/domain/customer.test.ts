import { filterByRole, isRole, type Customer } from '@/features/customers/domain/customer';

describe('isRole', () => {
  it.each(['Admin', 'Manager'])('accepts %s', (value) => {
    expect(isRole(value)).toBe(true);
  });

  it.each([['admin'], ['MANAGER'], ['Owner'], [''], [null]])('rejects %p', (value) => {
    expect(isRole(value)).toBe(false);
  });
});

describe('filterByRole', () => {
  const customers: Customer[] = [
    { id: '1', name: 'Amy', email: null, role: 'Admin' },
    { id: '2', name: 'Ben', email: null, role: 'Manager' },
    { id: '3', name: 'Cat', email: null, role: null },
  ];
  const ids = (list: Customer[]) => list.map((c) => c.id);

  it('keeps everyone, including customers without a role, for All', () => {
    expect(ids(filterByRole(customers, 'All'))).toEqual(['1', '2', '3']);
  });

  it.each([
    ['Admin', ['1']],
    ['Manager', ['2']],
  ] as const)('keeps only %s customers', (filter, expected) => {
    expect(ids(filterByRole(customers, filter))).toEqual(expected);
  });
});
