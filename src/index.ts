import cors from 'cors'
import multer from 'multer'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'

import { resolvers, typeDefs } from '@schema/index'
import { UsersDataSource } from '@schema/users/datasources'
import { ProjectsDataSource } from '@schema/projects/datasources'
import { TaskDataSource } from '@schema/tasks/datasouce'

const app = express()
const upload = multer({ dest: 'uploads/' })

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
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
  })

  await server.start()

  // Aplicar middleware do Apollo Server
  server.applyMiddleware({ app })

  app.use(
    cors({
      credentials: true,
      origin: [`${process.env.FRONT_END_ENDPOINT}`],
    }),
  )

  app.post('/upload', upload.single('avatar'), (req, res) => {
    return res.status(200).json({ message: 'Arquivo recebido com sucesso' })
  })

  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(
      `🚀 server listening: http://localhost:${process.env.SERVER_PORT}/ and sandbox listening: http://localhost:${process.env.SERVER_PORT}/graphql`,
    )
  })
}

startServer()
