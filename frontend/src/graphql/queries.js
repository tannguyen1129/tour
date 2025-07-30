import { gql } from '@apollo/client';

export const GET_TOURS = gql`
  query {
    tours {
      id
      title
      price
      location
      images
      videos
      itinerary
      servicesIncluded
      servicesExcluded
      cancelPolicy
      status
      category {
        id
        name
        description
      }
    }
  }
`;

export const GET_TOUR_DETAIL = gql`
  query($id: ID!) {
    tour(id: $id) {
      id
      title
      price
      location
      images
      videos
      itinerary
      servicesIncluded
      servicesExcluded
      cancelPolicy
      status
      category {
        id
        name
        description
      }
    }
  }
`;

export const GET_BOOKINGS = gql`
  query {
    bookings {
      id
      tour {
        id
        title
      }
      user {
        id
        email
      }
      passengers {
        name
        age
        type
      }
      voucher
      paymentMethod
      status
      paymentStatus
      createdAt
      updatedAt
    }
  }
`;

export const GET_REVIEWS = gql`
  query($tour: ID) {
    reviews(tour: $tour) {
      id
      rating
      comment
      reply
      images
      status
      createdAt
      updatedAt
      tour {
        id
        title
      }
      user {
        id
        email
      }
    }
  }
`;

export const GET_VOUCHERS = gql`
  query {
    vouchers {
      id
      code
      type
      value
      conditions
      validFrom
      validTo
      status
    }
  }
`;

export const GET_LOGS = gql`
  query {
    logs {
      id
      admin
      action
      detail
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query {
    users {
      id
      email
      phone
      role
      status
      lastLogin
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
      description
    }
  }
`;

export const GET_CATEGORY_DETAIL = gql`
  query($id: ID!) {
    category(id: $id) {
      id
      name
      description
    }
  }
`;

export const GET_PAYMENTS = gql`
  query {
    payments {
      id
      booking
      method
      amount
      status
      transactionId
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENT_DETAIL = gql`
  query($id: ID!) {
    payment(id: $id) {
      id
      booking
      method
      amount
      status
      transactionId
      createdAt
      updatedAt
    }
  }
`;
