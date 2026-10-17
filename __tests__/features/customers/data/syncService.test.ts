import type { ApiZellerCustomer, CustomerPage } from '@/features/customers/api/listZellerCustomers';
import {
  createCustomerSync,
  fetchAllCustomers,
  MAX_PAGES,
  type FetchAllResult,
} from '@/features/customers/data/syncService';

const apiCustomer = (id: string, name: string | null = `Customer ${id}`): ApiZellerCustomer => ({
  id,
  name,
  email: null,
  role: 'Admin',
});

/** A fake server: returns the scripted pages in order, keyed by the token that requests them. */
function fakeServer(pages: CustomerPage[]) {
  const fetchPage = jest.fn(async (nextToken: string | null) => {
    const index = nextToken === null ? 0 : Number(nextToken.replace('token-', ''));
    const page = pages[index];
    if (!page) throw new Error(`No page for token ${nextToken}`);
    return page;
  });
  return fetchPage;
}

const ids = ({ customers }: FetchAllResult) => customers.map((c) => c.id);

describe('fetchAllCustomers', () => {
  it('returns a single page', async () => {
    const fetchPage = fakeServer([
      { items: [apiCustomer('1'), apiCustomer('2')], nextToken: null },
    ]);

    expect(ids(await fetchAllCustomers(fetchPage))).toEqual(['1', '2']);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(null);
  });

  it('follows nextToken across pages, in order', async () => {
    const fetchPage = fakeServer([
      { items: [apiCustomer('1')], nextToken: 'token-1' },
      { items: [apiCustomer('2')], nextToken: 'token-2' },
      { items: [apiCustomer('3')], nextToken: null },
    ]);

    expect(ids(await fetchAllCustomers(fetchPage))).toEqual(['1', '2', '3']);
    expect(fetchPage.mock.calls.map(([token]) => token)).toEqual([null, 'token-1', 'token-2']);
  });

  it('keeps going past an empty page that still has a nextToken', async () => {
    const fetchPage = fakeServer([
      { items: [], nextToken: 'token-1' },
      { items: [apiCustomer('1')], nextToken: null },
    ]);

    expect(ids(await fetchAllCustomers(fetchPage))).toEqual(['1']);
  });

  it('skips null items and customers without a name', async () => {
    const fetchPage = fakeServer([
      { items: [apiCustomer('1'), null, apiCustomer('2', null)], nextToken: null },
    ]);
    const result = await fetchAllCustomers(fetchPage);

    expect(ids(result)).toEqual(['1']);
    expect(result.skipped).toBe(2);
  });

  it('fails without partial results when a page fails', async () => {
    const fetchPage = jest
      .fn<Promise<CustomerPage>, [string | null]>()
      .mockResolvedValueOnce({ items: [apiCustomer('1')], nextToken: 'token-1' })
      .mockRejectedValueOnce(new Error('Network request failed'));

    await expect(fetchAllCustomers(fetchPage)).rejects.toThrow('Network request failed');
  });

  it('stops if the server repeats a page token', async () => {
    const fetchPage = jest.fn(async () => ({ items: [], nextToken: 'same-token' }));

    await expect(fetchAllCustomers(fetchPage)).rejects.toThrow('repeated a page token');
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it(`stops after ${MAX_PAGES} pages`, async () => {
    let page = 0;
    const fetchPage = jest.fn(async () => ({ items: [], nextToken: `token-${++page}` }));

    await expect(fetchAllCustomers(fetchPage)).rejects.toThrow(`more than ${MAX_PAGES} pages`);
    expect(fetchPage).toHaveBeenCalledTimes(MAX_PAGES);
  });
});

describe('syncCustomers', () => {
  const setup = (fetchPage: jest.Mock<Promise<CustomerPage>, [string | null]>) => {
    const repository = { applyRemoteSnapshot: jest.fn(async () => {}) };
    const syncCustomers = createCustomerSync({ fetchPage, repository });
    return { repository, syncCustomers };
  };

  it('applies every fetched customer to the database and reports counts', async () => {
    const { repository, syncCustomers } = setup(
      fakeServer([
        { items: [apiCustomer('1')], nextToken: 'token-1' },
        { items: [apiCustomer('2'), apiCustomer('3', null)], nextToken: null },
      ]),
    );
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(syncCustomers()).resolves.toEqual({ received: 2, skipped: 1 });
    expect(repository.applyRemoteSnapshot).toHaveBeenCalledTimes(1);
    expect(repository.applyRemoteSnapshot).toHaveBeenCalledWith([
      expect.objectContaining({ id: '1' }),
      expect.objectContaining({ id: '2' }),
    ]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('skipped 1'));
    warn.mockRestore();
  });

  it('leaves the database untouched when fetching fails', async () => {
    const { repository, syncCustomers } = setup(
      jest.fn<Promise<CustomerPage>, [string | null]>().mockRejectedValue(new Error('Offline')),
    );

    await expect(syncCustomers()).rejects.toThrow('Offline');
    expect(repository.applyRemoteSnapshot).not.toHaveBeenCalled();
  });

  it('shares one run between calls made while a sync is in progress', async () => {
    const fetchPage = fakeServer([{ items: [apiCustomer('1')], nextToken: null }]);
    const { repository, syncCustomers } = setup(fetchPage);

    const [first, second] = await Promise.all([syncCustomers(), syncCustomers()]);

    expect(first).toBe(second);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(repository.applyRemoteSnapshot).toHaveBeenCalledTimes(1);
  });

  it('starts a new run once the previous one has finished, even after a failure', async () => {
    const fetchPage = jest
      .fn<Promise<CustomerPage>, [string | null]>()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce({ items: [apiCustomer('1')], nextToken: null });
    const { syncCustomers } = setup(fetchPage);

    await expect(syncCustomers()).rejects.toThrow('Offline');
    await expect(syncCustomers()).resolves.toEqual({ received: 1, skipped: 0 });
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});
