import jwt from 'jsonwebtoken'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

import { resolvers, typeDefs } from '@schema/index'
import { UsersDataSource } from '@schema/users/datasources'
import { UserIsLoggedIn } from '@context/types'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  context: async ({ req, res }) => {
    let tokenAndrRefreshToken: string[] = []

    if (req.headers.cookie) {
      const [refresh_token, auth_token] = req.headers.cookie.split('; ')
      tokenAndrRefreshToken = [auth_token.split('=')[1]]
    }

    const payload = jwt.verify(
      tokenAndrRefreshToken[0],
      process.env.JWT_SECRET,
      // { Desativar só quando tiver a lógica de refresh token no front-end, pq aí vai lançar um erro, e o client vai ser responsavel por criar a fila de req e atualizar o token em cada uma delas
      //   ignoreExpiration: false,
      // },
    ) as UserIsLoggedIn

    return {
      res,
      userIsLoggedIn: {
        user_id: payload.user_id,
        user_email: payload.user_email,
      },
      dataSources: {
        usersDataSource: new UsersDataSource(),
      },
    }
  },
})
  .then(({ url }) => console.log(`server on in url ${url}`))
  .catch((e) => console.error(e))
