import { gql } from 'apollo-server-express';

export default gql`
  type Category {
    id: ID!
    name: String!
    description: String
  }

  type Tour {
    id: ID!
    title: String!
    price: Float!
    itinerary: String
    servicesIncluded: [String]
    servicesExcluded: [String]
    cancelPolicy: String
    images: [String]
    videos: [String]
    location: String
    category: Category  # ✅ Trả về Category object đã populate
    status: String
    isDeleted: Boolean
    version: Int
    createdAt: String
    updatedAt: String
  }

  input TourInput {
    title: String!
    price: Float!
    itinerary: String
    servicesIncluded: [String]
    servicesExcluded: [String]
    cancelPolicy: String
    images: [String]
    videos: [String]
    location: String
    category: ID
    status: String
  }

  input TourUpdateInput {
    title: String
    price: Float
    itinerary: String
    servicesIncluded: [String]
    servicesExcluded: [String]
    cancelPolicy: String
    images: [String]
    videos: [String]
    location: String
    category: ID
    status: String
  }

  extend type Query {
    tours: [Tour]
    tour(id: ID!): Tour
  }

  extend type Mutation {
    createTour(input: TourInput!): Tour
    updateTour(id: ID!, input: TourUpdateInput!): Tour
    deleteTour(id: ID!): Boolean
  }
`;
