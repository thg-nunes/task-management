import { Express } from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'

import { Context } from '@context/types'

import { expressApp } from './services/express'

import { resolvers, typeDefs } from '@schema/index'
import { TaskDataSource } from '@schema/tasks/datasouce'
import { UsersDataSource } from '@schema/users/datasources'
import { ProjectsDataSource } from '@schema/projects/datasources'

async function startServer({ expressApp }: { expressApp: Express }) {
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  })

  await server.start()

  expressApp.use(
    '/graphql/api/',
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

  expressApp.listen(process.env.SERVER_PORT, () =>
    console.log(
      `server listening: http://localhost:${process.env.SERVER_PORT}/graphql/api/`,
    ),
  )
}

startServer({ expressApp })
