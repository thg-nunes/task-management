export const usersTypeDefs = `#graphql
  extend type Query {
    getUser(email: String!): User!
    getUsers: [User!]!
  }

  extend type Mutation {
    signIn(signData: SignInput!): SignResponse!
    refresh_token: Boolean!
    createAccount(userData: CreateAccountInput!): SignResponse!
    updateProfile(userUpdateProfile: UserUpdateProfileInput!): User!
    deleteProfile: Boolean!
  }

  input SignInput {
    email: String!
    password: String!
  }

  type SignResponse {
    id: String!
    username: String!
    email: String!
    token: String!
    avatarId: Int
    refresh_token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    created_at: String!
    updated_at: String!
    token: String!
    refresh_token: String!
    avatarId: [String!]!
    member_of_projects: [Project!]!
    author_of_projects: [Project!]!
    tasks: [Task]!
  }

  input CreateAccountInput {
    username: String!
    email: String!
    password: String!
  }

  input UserUpdateProfileInput {
    email: String
    username: String
    password: String
  }
`
