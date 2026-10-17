import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Customer, Role, RoleFilter } from '../domain/customer';

export type CustomerListFilter = {
  role: RoleFilter;
  search: string;
};

/** What the form saves. A role is required here, even though API customers may lack one. */
export type NewCustomer = Omit<Customer, 'id' | 'role'> & { role: Role };

/**
 * Start of every read: the `Customer` fields only, never soft-deleted rows. `role` is safe to
 * read as `Role | null`: the column's CHECK constraint allows nothing else.
 */
const SELECT_VISIBLE_CUSTOMERS = `
  SELECT id, name, email, role
  FROM customers
  WHERE deleted_at IS NULL`;

/** Escapes LIKE wildcards so user input is matched literally. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

/** The only place that knows customers are stored in SQLite. */
export function createCustomerRepository(db: SQLiteDatabase) {
  return {
    /** Customers that aren't deleted, matching the filter, sorted by name. */
    list({ role, search }: CustomerListFilter): Promise<Customer[]> {
      // A NULL role never equals a filter value, so those customers appear under 'All' only.
      return db.getAllAsync<Customer>(
        `${SELECT_VISIBLE_CUSTOMERS}
           AND (? = 'All' OR role = ?)
           AND name LIKE ? ESCAPE '\\'
         ORDER BY name COLLATE NOCASE`,
        [role, role, `%${escapeLike(search.trim())}%`],
      );
    },

    /** A customer that isn't deleted, or `null` if there is none with this id. */
    getById(id: string): Promise<Customer | null> {
      return db.getFirstAsync<Customer>(
        `${SELECT_VISIBLE_CUSTOMERS}
           AND id = ?`,
        [id],
      );
    },

    /** Adds a customer created in the app. Local-only: never sent to the API. */
    async create(input: NewCustomer): Promise<Customer> {
      const customer: Customer = { id: randomUUID(), ...input };
      // is_dirty = 1: this row has changes the server doesn't know about.
      await db.runAsync(
        `INSERT INTO customers (id, name, email, role, source, is_dirty)
         VALUES (?, ?, ?, ?, 'local', 1)`,
        [customer.id, customer.name, customer.email, customer.role],
      );
      return customer;
    },

    /**
     * Replaces a customer's editable fields. Marking the row dirty means a later sync won't
     * overwrite this edit (local wins).
     */
    async update(id: string, changes: NewCustomer): Promise<Customer> {
      const { changes: updatedRows } = await db.runAsync(
        `UPDATE customers
         SET name = ?, email = ?, role = ?, is_dirty = 1
         WHERE id = ? AND deleted_at IS NULL`,
        [changes.name, changes.email, changes.role, id],
      );
      if (updatedRows === 0) {
        throw new Error(`Customer ${id} not found`);
      }
      return { id, ...changes };
    },

    /**
     * Soft delete: the row is kept as a tombstone so a later sync doesn't bring the
     * customer back. `list` hides it.
     */
    async remove(id: string): Promise<void> {
      const { changes: deletedRows } = await db.runAsync(
        `UPDATE customers
         SET deleted_at = ?, is_dirty = 1
         WHERE id = ? AND deleted_at IS NULL`,
        [Date.now(), id],
      );
      if (deletedRows === 0) {
        throw new Error(`Customer ${id} not found`);
      }
    },
  };
}

export type CustomerRepository = ReturnType<typeof createCustomerRepository>;
