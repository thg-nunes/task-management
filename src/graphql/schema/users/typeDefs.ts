export const usersTypeDefs = `#graphql
  extend type Query {
    userByEmailExists(email: String!): Boolean!
  }

  extend type Mutation {
    createUser(userData: CreateUserInput!): User!
    updatePassword(updatePassword: UpdatePasswordInput!): Boolean!
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
`
