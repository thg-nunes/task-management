// [] criar um campo na db para adicionar uma foto
// [] no updateProfile criar um campo para receber um foto
// [] armazenar a foto na db

export const usersTypeDefs = `#graphql
  extend type Mutation {
    sign(signData: SignInput!): SignResponse!
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
    projects_member: [ProjectMembers!]!
    projects_author: [Project!]!
    comments_creted: [Comment]!
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
