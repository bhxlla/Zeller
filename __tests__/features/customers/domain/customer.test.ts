import { isRole } from '@/features/customers/domain/customer';

describe('isRole', () => {
  it.each(['Admin', 'Manager'])('accepts %s', (value) => {
    expect(isRole(value)).toBe(true);
  });

  it.each([['admin'], ['MANAGER'], ['Owner'], [''], [null]])('rejects %p', (value) => {
    expect(isRole(value)).toBe(false);
  });
});
