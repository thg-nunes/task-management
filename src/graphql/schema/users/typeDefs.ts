export const usersTypeDefs = `#graphql
  extend type Query {
    userByEmailExists(email: String!): Boolean!
  }

  extend type Mutation {
    sign(signData: SignInput!): SignResponse!
    createUser(userData: CreateUserInput!): User!
    updatePassword(updatePassword: UpdatePasswordInput!): Boolean!
    updateProfile(userUpdateProfile: UserUpdateProfileInput!): User!
    deleteProfile: Boolean!
  }

  input SignInput {
    email: String!
    password: String!
  }

  type SignResponse {
    token: String!
    refresh_token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    created_at: String!
    updated_at: String!
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
  }

  input UpdatePasswordInput {
    email: String!
    old_password: String!
    new_password: String!
  }

  input UserUpdateProfileInput {
    email: String
    username: String
    password: String
  }
`
