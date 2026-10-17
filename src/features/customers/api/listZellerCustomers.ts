import { gql, type ApolloClient, type TypedDocumentNode } from '@apollo/client';

/** Customers requested per page. */
const PAGE_SIZE = 100;

// Types mirror schema.gql exactly, nullability included. Mapping to the domain `Customer`
// happens in the mapper, not here.

export type ApiZellerCustomer = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

export type ListZellerCustomersData = {
  listZellerCustomers: {
    items: (ApiZellerCustomer | null)[] | null;
    nextToken: string | null;
  } | null;
};

export type ListZellerCustomersVariables = {
  limit?: number;
  nextToken?: string | null;
};

export const LIST_ZELLER_CUSTOMERS: TypedDocumentNode<
  ListZellerCustomersData,
  ListZellerCustomersVariables
> = gql`
  query ListZellerCustomers($limit: Int, $nextToken: String) {
    listZellerCustomers(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        role
      }
      nextToken
    }
  }
`;

export type CustomerPage = {
  items: (ApiZellerCustomer | null)[];
  nextToken: string | null;
};

/**
 * Fetches one page of customers; `nextToken: null` asks for the first page.
 * A missing connection or item list is treated as an empty, final page.
 */
export async function fetchCustomerPage(
  client: ApolloClient,
  nextToken: string | null,
): Promise<CustomerPage> {
  const { data } = await client.query({
    query: LIST_ZELLER_CUSTOMERS,
    variables: { limit: PAGE_SIZE, nextToken },
  });
  if (!data) {
    throw new Error('listZellerCustomers returned no data');
  }

  return {
    items: data.listZellerCustomers?.items ?? [],
    nextToken: data.listZellerCustomers?.nextToken ?? null,
  };
}
