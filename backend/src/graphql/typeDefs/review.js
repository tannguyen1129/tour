import { gql } from 'apollo-server-express';

export default gql`
  type Review {
    id: ID!
    tour: Tour!
    user: User!
    rating: Int!
    comment: String
    images: [String]
    reply: String          # ✅ Thêm reply
    status: String
    isDeleted: Boolean
    createdAt: String
    updatedAt: String
  }

  type Tour {
    id: ID!
    title: String
  }

  type User {
    id: ID!
    email: String
  }

  extend type Query {
    reviews(tour: ID): [Review]
    review(id: ID!): Review
  }

  extend type Mutation {
    createReview(
      tour: ID!
      rating: Int!
      comment: String
      images: [String]
    ): Review

    updateReview(
      id: ID!
      rating: Int
      comment: String
      status: String
      images: [String]
    ): Review

    deleteReview(id: ID!): Boolean

    replyReview(                 # ✅ Mutation mới để admin phản hồi
      id: ID!
      reply: String!
    ): Review
  }
`;
