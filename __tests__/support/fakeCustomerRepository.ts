import type { CustomerRepository } from '@/features/customers/data/customerRepository';
import type { Customer, NewCustomer } from '@/features/customers/domain/customer';

type Row = Customer & {
  source: 'remote' | 'local';
  isDirty: boolean;
  deleted: boolean;
};

/**
 * In-memory stand-in for the SQLite repository, with the same rules: soft delete, local wins on
 * sync, case-insensitive search and sorting, and a change notification after every write.
 * `stored` customers start as clean rows from the server.
 */
export function createFakeCustomerRepository(stored: readonly Customer[] = []) {
  const rows = new Map<string, Row>(
    stored.map((customer) => [
      customer.id,
      { ...customer, source: 'remote', isDirty: false, deleted: false },
    ]),
  );
  const listeners = new Set<() => void>();
  let nextLocalId = 1;

  const notify = () => listeners.forEach((listener) => listener());
  const toCustomer = ({ id, name, email, role }: Row): Customer => ({ id, name, email, role });
  const visibleRow = (id: string) => {
    const row = rows.get(id);
    return row && !row.deleted ? row : undefined;
  };

  const repository: CustomerRepository = {
    async list({ role, search }) {
      const query = search.trim().toLowerCase();
      return [...rows.values()]
        .filter((row) => !row.deleted)
        .filter((row) => role === 'All' || row.role === role)
        .filter((row) => row.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        .map(toCustomer);
    },

    async getById(id) {
      const row = visibleRow(id);
      return row ? toCustomer(row) : null;
    },

    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },

    async create(input: NewCustomer) {
      const customer: Customer = { id: `local-${nextLocalId++}`, ...input };
      rows.set(customer.id, { ...customer, source: 'local', isDirty: true, deleted: false });
      notify();
      return customer;
    },

    async update(id, changes) {
      const row = visibleRow(id);
      if (!row) throw new Error(`Customer ${id} not found`);
      rows.set(id, { ...row, ...changes, isDirty: true });
      notify();
      return { id, ...changes };
    },

    async remove(id) {
      const row = visibleRow(id);
      if (!row) throw new Error(`Customer ${id} not found`);
      rows.set(id, { ...row, deleted: true, isDirty: true });
      notify();
    },

    async applyRemoteSnapshot(customers) {
      const remoteIds = new Set(customers.map((customer) => customer.id));
      for (const [id, row] of rows) {
        if (row.source === 'remote' && !row.isDirty && !remoteIds.has(id)) rows.delete(id);
      }
      for (const customer of customers) {
        const row = rows.get(customer.id);
        if (!row) {
          rows.set(customer.id, { ...customer, source: 'remote', isDirty: false, deleted: false });
        } else if (!row.isDirty) {
          rows.set(customer.id, { ...row, ...customer });
        }
      }
      notify();
    },
  };

  return repository;
}
