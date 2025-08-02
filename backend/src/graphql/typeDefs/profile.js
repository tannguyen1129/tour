import { gql } from 'apollo-server-express';

export default gql`
  type EmergencyContact {
    name: String
    phone: String
    relationship: String
  }

  type Profile {
    id: ID!
    user: User!
    fullName: String
    gender: String
    dob: String
    address: String
    avatar: String
    identityNumber: String
    issuedDate: String
    issuedPlace: String
    nationality: String
    emergencyContact: EmergencyContact
    createdAt: String
    updatedAt: String
  }

  input EmergencyContactInput {
    name: String
    phone: String
    relationship: String
  }

  input ProfileInput {
    fullName: String
    gender: String
    dob: String
    address: String
    avatar: String
    identityNumber: String
    issuedDate: String
    issuedPlace: String
    nationality: String
    emergencyContact: EmergencyContactInput
  }

  type Query {
    getMyProfile: Profile
    getProfileByUser(userId: ID!): Profile
  }

  type Mutation {
    createProfile(userId: ID!, input: ProfileInput!): Profile
    updateMyProfile(input: ProfileInput!): Profile
    deleteMyProfile: Boolean
  }
`;
