import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

import { resolvers, typeDefs } from '@schema/index'
import { UsersDataSource } from '@schema/users/datasources'
import { ProjectsDataSource } from '@schema/projects/datasources'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  context: async ({ req, res }) => {
    return {
      req,
      res,
      dataSources: {
        usersDataSource: new UsersDataSource(),
        projectsDataSource: new ProjectsDataSource(),
      },
    }
  },
})
  .then(({ url }) => console.log(`server on in url ${url}`))
  .catch((e) => console.error(e))
