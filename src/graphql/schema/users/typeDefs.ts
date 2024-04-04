export const usersTypeDefs = `#graphql
  extend type Mutation {
    createUser(userData: CreateUserInput!): User!
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
`
