import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const CREATE_TOUR = gql`
  mutation($input: TourInput!) {
    createTour(input: $input) {
      id
      title
      price
      location
      images
      videos
      category {
        id
        name
      }
    }
  }
`;

export const UPDATE_TOUR = gql`
  mutation($id: ID!, $input: TourUpdateInput!) {
    updateTour(id: $id, input: $input) {
      id
      title
      price
      location
      images
      videos
      category {
        id
        name
      }
    }
  }
`;

export const DELETE_TOUR = gql`
  mutation($id: ID!) {
    deleteTour(id: $id)
  }
`;

export const CREATE_BOOKING = gql`
  mutation($input: BookingInput!) {
    createBooking(input: $input) {
      id
      status
      paymentStatus
    }
  }
`;

export const UPDATE_BOOKING = gql`
  mutation($id: ID!, $status: String, $paymentStatus: String) {
    updateBooking(id: $id, status: $status, paymentStatus: $paymentStatus) {
      id
      status
      paymentStatus
    }
  }
`;

export const DELETE_BOOKING = gql`
  mutation($id: ID!) {
    deleteBooking(id: $id)
  }
`;

export const CREATE_REVIEW = gql`
  mutation (
    $tour: ID!
    $rating: Int!
    $comment: String
    $images: [String]
  ) {
    createReview(
      tour: $tour
      rating: $rating
      comment: $comment
      images: $images
    ) {
      id
      rating
      comment
      images
      status
      createdAt
      updatedAt
      reply
      user {
        id
        email
      }
      tour {
        id
        title
      }
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation (
    $id: ID!
    $rating: Int
    $comment: String
    $status: String
    $images: [String]
  ) {
    updateReview(
      id: $id
      rating: $rating
      comment: $comment
      status: $status
      images: $images
    ) {
      id
      rating
      comment
      images
      status
      reply
      updatedAt
      user {
        id
        email
      }
      tour {
        id
        title
      }
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const REPLY_REVIEW = gql`
  mutation($id: ID!, $reply: String!) {
    replyReview(id: $id, reply: $reply) {
      id
      reply
      updatedAt
      user {
        id
        email
      }
      tour {
        id
        title
      }
    }
  }
`;

export const CREATE_VOUCHER = gql`
  mutation CreateVoucher(
    $code: String!
    $type: String!
    $value: Float!
    $conditions: String
    $validFrom: DateTime
    $validTo: DateTime
    $status: String
  ) {
    createVoucher(
      code: $code
      type: $type
      value: $value
      conditions: $conditions
      validFrom: $validFrom
      validTo: $validTo
      status: $status
    ) {
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

export const UPDATE_VOUCHER = gql`
  mutation UpdateVoucher(
    $id: ID!
    $code: String
    $type: String
    $value: Float
    $conditions: String
    $validFrom: DateTime
    $validTo: DateTime
    $status: String
  ) {
    updateVoucher(
      id: $id
      code: $code
      type: $type
      value: $value
      conditions: $conditions
      validFrom: $validFrom
      validTo: $validTo
      status: $status
    ) {
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


export const DELETE_VOUCHER = gql`
  mutation($id: ID!) {
    deleteVoucher(id: $id)
  }
`;

export const CREATE_CATEGORY = gql`
  mutation($name: String!, $description: String) {
    createCategory(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation($id: ID!, $name: String, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const CHECKOUT = gql`
  mutation($bookingId: ID!, $method: String!) {
    checkout(bookingId: $bookingId, method: $method) {
      payUrl
      payment {
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
  }
`;

export const CONFIRM_PAYMENT = gql`
  mutation($paymentId: ID!, $transactionId: String!) {
    confirmPayment(paymentId: $paymentId, transactionId: $transactionId) {
      id
      booking
      method
      amount
      status
      transactionId
      updatedAt
    }
  }
`;
