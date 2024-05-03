import cors from 'cors'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'

import { resolvers, typeDefs } from '@schema/index'
import { UsersDataSource } from '@schema/users/datasources'
import { ProjectsDataSource } from '@schema/projects/datasources'
import { TaskDataSource } from '@schema/tasks/datasouce'
import { Context } from '@context/types'
;(async () => {
  const app = express()

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  })

  await server.start()

  app.use(
    '/',
    cors({
      credentials: true,
      origin: [`${process.env.FRONT_END_ENDPOINT}`],
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {
          req,
          res,
          dataSources: {
            taskDataSource: new TaskDataSource(),
            usersDataSource: new UsersDataSource(),
            projectsDataSource: new ProjectsDataSource(),
          },
        }
      },
    }),
  )

  app.listen(process.env.SERVER_PORT, () =>
    console.log(
      `server listening: http://localhost:${process.env.SERVER_PORT}/`,
    ),
  )
})()
