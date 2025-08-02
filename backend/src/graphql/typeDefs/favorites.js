// typeDefs/favorites.js
import { gql } from 'apollo-server-express';

export default gql`
  scalar DateTime

  type Favorite {
    id: ID!
    user: User!
    tour: Tour!
    isDeleted: Boolean
    order: Int  # ✅ Thêm field order
    createdAt: String!
    updatedAt: String!
  }

  type FavoriteResponse {
    success: Boolean!
    message: String!
    favorite: Favorite
  }

  type FavoritesListResponse {
    success: Boolean!
    message: String!
    favorites: [Favorite!]!
    total: Int!
  }

  # ✅ Thêm response type cho reorder
  type ReorderResponse {
    success: Boolean!
    message: String!
    favorites: [Favorite!]!
  }

  extend type Query {
    getFavorites(limit: Int, offset: Int): FavoritesListResponse!
    isFavorite(tourId: ID!): Boolean!
    getTourFavorites(tourId: ID!): FavoritesListResponse!
  }

  extend type Mutation {
    addToFavorites(tourId: ID!): FavoriteResponse!
    removeFromFavorites(tourId: ID!): FavoriteResponse!
    toggleFavorite(tourId: ID!): FavoriteResponse!
    
    # ✅ Thêm mutation reorder
    reorderFavorites(favoriteIds: [ID!]!): ReorderResponse!
  }
`;
