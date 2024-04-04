import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

import { resolvers, typeDefs } from '@schema/index'
import { UsersDataSource } from '@schema/users/datasources'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  context: async ({ req, res }) => {
    return {
      res,
      dataSources: {
        usersDataSource: new UsersDataSource(),
      },
    }
  },
})
  .then(({ url }) => console.log(`server on in url ${url}`))
  .catch((e) => console.error(e))
