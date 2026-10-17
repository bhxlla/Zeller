import { toCustomer } from '../api/customerMapper';
import type { CustomerPage } from '../api/listZellerCustomers';
import type { Customer } from '../domain/customer';
import type { CustomerRepository } from './customerRepository';

/** Fetches one page of customers; `null` asks for the first page. */
export type FetchCustomerPage = (nextToken: string | null) => Promise<CustomerPage>;

/** Safety net against a server that never stops paginating. */
export const MAX_PAGES = 100;

export type FetchAllResult = {
  customers: Customer[];
  /** Items the API sent that can't be shown (null, or no name). */
  skipped: number;
};

/**
 * Fetches every page and maps the results to domain customers. All or nothing: if any page
 * fails, it throws and returns nothing, so callers never act on a partial list.
 */
export async function fetchAllCustomers(fetchPage: FetchCustomerPage): Promise<FetchAllResult> {
  const customers: Customer[] = [];
  let skipped = 0;
  const seenTokens = new Set<string>();
  let nextToken: string | null = null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await fetchPage(nextToken);

    for (const item of result.items) {
      const customer = item && toCustomer(item);
      if (customer) customers.push(customer);
      else skipped++;
    }

    // An empty page can still have a nextToken (DynamoDB scans), so only the token ends the loop.
    if (result.nextToken === null) return { customers, skipped };
    if (seenTokens.has(result.nextToken)) {
      throw new Error('Customer sync aborted: the server repeated a page token');
    }
    seenTokens.add(result.nextToken);
    nextToken = result.nextToken;
  }

  throw new Error(`Customer sync aborted: more than ${MAX_PAGES} pages`);
}

export type SyncResult = {
  received: number;
  skipped: number;
};

type SyncDependencies = {
  fetchPage: FetchCustomerPage;
  repository: Pick<CustomerRepository, 'applyRemoteSnapshot'>;
};

/**
 * Creates the `syncCustomers` function: fetches every customer from the API and applies them to
 * the local database. Calls made while a sync is running share it instead of starting another.
 */
export function createCustomerSync({ fetchPage, repository }: SyncDependencies) {
  let inFlight: Promise<SyncResult> | null = null;

  async function run(): Promise<SyncResult> {
    const { customers, skipped } = await fetchAllCustomers(fetchPage);
    await repository.applyRemoteSnapshot(customers);
    if (skipped > 0) {
      console.warn(`Customer sync skipped ${skipped} item(s) without a name`);
    }
    return { received: customers.length, skipped };
  }

  return function syncCustomers(): Promise<SyncResult> {
    inFlight ??= run().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}
