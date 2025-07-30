import { gql } from 'apollo-server-express';

export default gql`
  type Booking {
    id: ID!
    user: User
    tour: Tour
    passengers: [Passenger]
    voucher: ID
    paymentMethod: String
    status: String
    paymentStatus: String
    isDeleted: Boolean
    createdAt: String
    updatedAt: String
  }

  type Passenger {
    name: String
    age: Int
    type: String
  }

  input PassengerInput {
    name: String!
    age: Int!
    type: String!
  }

  input BookingInput {
    tour: ID!
    passengers: [PassengerInput!]!
    voucher: ID
    paymentMethod: String
  }

  extend type Query {
    bookings: [Booking]
    booking(id: ID!): Booking
  }

  extend type Mutation {
    createBooking(input: BookingInput!): Booking
    updateBooking(id: ID!, status: String, paymentStatus: String): Booking
    deleteBooking(id: ID!): Boolean
  }
`;
