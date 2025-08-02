import { gql } from 'apollo-server-express';

export default gql`
  scalar DateTime 

  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime  
    updatedAt: DateTime
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
    category: Category
    status: String
    isDeleted: Boolean
    version: Int
    createdAt: DateTime  
    updatedAt: DateTime 
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
