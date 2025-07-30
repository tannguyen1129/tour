import { gql } from 'apollo-server-express';

export default gql`
  type Log {
    id: ID!
    admin: ID!
    action: String!
    detail: String
    createdAt: String
  }

  extend type Query {
    logs: [Log]
  }
`;
