import type { Customer } from '@/features/customers/domain/customer';
import { groupByInitial } from '@/features/customers/domain/sections';

const customer = (name: string): Customer => ({
  id: name,
  name,
  email: null,
  role: 'Manager',
});

const titlesAndNames = (customers: Customer[]) =>
  groupByInitial(customers).map(({ title, data }) => [title, data.map((c) => c.name)]);

describe('groupByInitial', () => {
  it('returns no sections for no customers', () => {
    expect(groupByInitial([])).toEqual([]);
  });

  it('groups by first letter, with sections and names in alphabetical order', () => {
    const customers = ['Harvey Norman', 'Brad Herman', 'Cecil Boyle IV', 'Barbara Streider'].map(
      customer,
    );

    expect(titlesAndNames(customers)).toEqual([
      ['B', ['Barbara Streider', 'Brad Herman']],
      ['C', ['Cecil Boyle IV']],
      ['H', ['Harvey Norman']],
    ]);
  });

  it('ignores case and leading whitespace', () => {
    expect(titlesAndNames(['brad', '  Barbara', 'Bob'].map(customer))).toEqual([
      ['B', ['  Barbara', 'Bob', 'brad']],
    ]);
  });

  it('puts names without a leading letter in a trailing "#" section', () => {
    expect(titlesAndNames(['1st Customer', 'Zed', ''].map(customer))).toEqual([
      ['Z', ['Zed']],
      ['#', ['', '1st Customer']],
    ]);
  });

  it('does not mutate the input', () => {
    const customers = ['Zed', 'Amy'].map(customer);
    groupByInitial(customers);
    expect(customers.map((c) => c.name)).toEqual(['Zed', 'Amy']);
  });
});
