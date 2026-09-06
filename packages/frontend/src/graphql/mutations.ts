import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        role
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        role
        createdAt
      }
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
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

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      totalItems
      subtotal
      items {
        id
        userId
        productId
        quantity
        createdAt
        updatedAt
        product {
          id
          title
          description
          price
          category
          imageUrl
          stock
          rating
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      totalItems
      subtotal
      items {
        id
        userId
        productId
        quantity
        createdAt
        updatedAt
        product {
          id
          title
          description
          price
          category
          imageUrl
          stock
          rating
        }
      }
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveFromCart($cartItemId: ID!) {
    removeFromCart(cartItemId: $cartItemId) {
      totalItems
      subtotal
      items {
        id
        userId
        productId
        quantity
        createdAt
        updatedAt
        product {
          id
          title
          description
          price
          category
          imageUrl
          stock
          rating
        }
      }
    }
  }
`;

export const CLEAR_CART_MUTATION = gql`
  mutation ClearCart {
    clearCart
  }
`;
