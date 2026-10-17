import { gql, type TypedDocumentNode } from '@apollo/client';

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
