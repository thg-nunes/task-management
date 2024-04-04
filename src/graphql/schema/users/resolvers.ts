import { Context } from '@context/types'
import {
  CreateUserInput,
  SignInput,
  SignResponse,
  UpdatePasswordInput,
} from './types'

// Query Resolvers
const userByEmailExists = async (
  _,
  { email }: { email: string },
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.userByEmailExists(email)
}

// Mutations Resolvers
const sign = async (
  _,
  { signData }: SignInput,
  { dataSources, res }: Context,
): Promise<SignResponse> => {
  const { token, refresh_token } = await dataSources.usersDataSource.sign({
    signData,
  })
  res.setHeader('Set-Cookie', [
    `authToken=${token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
    `refresh_token=${refresh_token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
  ])

  return { token, refresh_token }
}

const createUser = async (
  _,
  { userData }: CreateUserInput,
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.createUser({ userData })
}

const updatePassword = async (
  _,
  { updatePassword }: UpdatePasswordInput,
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.updatePassword({ updatePassword })
}

export const usersResolvers = {
  Query: { userByEmailExists },
  Mutation: { sign, createUser, updatePassword },
}
