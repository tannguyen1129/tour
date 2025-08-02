import { gql } from 'apollo-server-express';

export default gql`
  scalar DateTime  

  type Payment {
    id: ID!
    booking: ID!
    method: String!
    amount: Float!
    status: String!
    transactionId: String
    createdAt: DateTime!  
    updatedAt: DateTime!  
  }
  type CheckoutResult {
    payment: Payment!
    payUrl: String!
  }

  extend type Query {
    payments: [Payment]
    payment(id: ID!): Payment
    # ✅ Thêm getPaymentByBooking vào Query
    getPaymentByBooking(bookingId: ID!): Payment
  }

  extend type Mutation {
    checkout(bookingId: ID!, method: String!): CheckoutResult
    # ✅ Fix: Make paymentId optional to match frontend
    confirmPayment(paymentId: ID, transactionId: String!): Payment
  }
`;
