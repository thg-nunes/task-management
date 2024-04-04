import { usersTypeDefs } from './users/typeDefs'

const rootTypeDefs = `#graphql
  type Query {
    _empty: Boolean!
  }

  type Mutation {
    _empty: Boolean!
  }
`

const rootResolvers = {
  Query: {
    _empty: () => true,
  },
  Mutation: {
    _empty: () => true,
  },
}

export const typeDefs = [rootTypeDefs, usersTypeDefs]
export const resolvers = [rootResolvers]
