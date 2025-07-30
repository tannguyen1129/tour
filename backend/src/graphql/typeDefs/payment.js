import { gql } from 'apollo-server-express';

export default gql`
type Payment {
  id: ID!
  booking: ID!
  method: String!
  amount: Float!
  status: String!
  transactionId: String
  createdAt: String
  updatedAt: String
}

type CheckoutResult {
  payment: Payment!
  payUrl: String!
}

extend type Query {
  payments: [Payment]
  payment(id: ID!): Payment
}

extend type Mutation {
  checkout(bookingId: ID!, method: String!): CheckoutResult
  confirmPayment(paymentId: ID!, transactionId: String!): Payment
}
`;
