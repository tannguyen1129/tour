import { gql } from 'apollo-server-express';

export default gql`
  type User {
    id: ID!
    email: String!
    phone: String
    role: String!
    status: String!
    lastLogin: String
    createdBy: ID
    updatedBy: ID
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User]
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateUser(id: ID!, email: String, password: String): User
    deleteUser(id: ID!): Boolean
  }
`;
