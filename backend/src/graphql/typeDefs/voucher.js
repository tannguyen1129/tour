import { gql } from 'apollo-server-express';

export default gql`
  scalar DateTime

  type Voucher {
    id: ID!
    code: String!
    type: String!
    value: Float!
    conditions: String
    validFrom: DateTime
    validTo: DateTime
    status: String!
    createdBy: ID
    updatedBy: ID
    createdAt: DateTime
    updatedAt: DateTime
  }

  extend type Query {
    vouchers: [Voucher]
    voucher(id: ID!): Voucher
  }

  extend type Mutation {
    createVoucher(
      code: String!
      type: String!
      value: Float!
      conditions: String
      validFrom: DateTime
      validTo: DateTime
      status: String
    ): Voucher

    updateVoucher(
      id: ID!
      code: String
      type: String
      value: Float
      conditions: String
      validFrom: DateTime
      validTo: DateTime
      status: String
    ): Voucher

    deleteVoucher(id: ID!): Boolean
  }
`;
