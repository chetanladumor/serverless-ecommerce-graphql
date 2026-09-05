import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const PRODUCTS_QUERY = gql`
  query Products($filter: ProductFilterInput) {
    products(filter: $filter) {
      id
      title
      description
      price
      category
      imageUrl
      stock
      rating
      createdAt
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories
  }
`;
