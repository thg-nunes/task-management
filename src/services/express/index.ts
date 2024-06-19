import cors from 'cors'
import express from 'express'
import { userRoutes } from './user.routes'

const expressApp = express()

expressApp.use(
  cors({
    credentials: true,
    origin: [
      `${process.env.FRONT_END_ENDPOINT}`,
      `${process.env.FRONT_END_MOBILE_EMULATOR_ENDPOINT}`,
    ],
  }),
)

expressApp.use(express.json())
expressApp.use('/user', userRoutes)

export { expressApp }
