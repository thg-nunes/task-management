import { usersTypeDefs } from './users/typeDefs'
import { usersResolvers } from './users/resolvers'
import { projectsTypedefs } from './projects/typeDefs'
import { projectsResolvers } from './projects/resolvers'
import { tasksTypeDefs } from './tasks/typeDefs'
import { tasksResolvers } from './tasks/resolvers'

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

export const typeDefs = [
  rootTypeDefs,
  usersTypeDefs,
  projectsTypedefs,
  tasksTypeDefs,
]
export const resolvers = [
  rootResolvers,
  usersResolvers,
  projectsResolvers,
  tasksResolvers,
]
