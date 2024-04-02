import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

const rootTypeDefs = `#graphql
  type Query {
    _empty: Boolean!
  }
`

const rootResolvers = {
  Query: {
    _empty: () => true,
  },
}

const server = new ApolloServer({
  typeDefs: [rootTypeDefs],
  resolvers: [rootResolvers],
})

startStandaloneServer(server, {
  context: async ({ req, res }) => {
    return {
      dataSources: {},
    }
  },
})
  .then(({ url }) => console.log(`server on in url ${url}`))
  .catch((e) => console.error(e))
