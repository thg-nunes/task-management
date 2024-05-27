// [] criar um campo na db para adicionar uma foto
// [] no updateProfile criar um campo para receber um foto
// [] armazenar a foto na db

export const usersTypeDefs = `#graphql
  extend type Query {
    getUser(user_id: String!): User!
    getUsers: [User!]!
  }

  extend type Mutation {
    signIn(signData: SignInput!): SignResponse!
    refresh_token: Boolean!
    createUser(userData: CreateUserInput!): User!
    updateProfile(userUpdateProfile: UserUpdateProfileInput!): User!
    deleteProfile: Boolean!
    signOut: Boolean!
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
    member_of_projects: [Project!]!
    author_of_projects: [Project!]!
    tasks: [Task]!
  }

  input CreateUserInput {
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
