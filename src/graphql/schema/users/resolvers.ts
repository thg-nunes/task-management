import { Context } from '@context/types'
import {
  CreateUserInput,
  SignInput,
  SignResponse,
  UserUpdateProfileInput,
} from './types'
import { AppError } from '@utils/appError'

// Query Resolvers

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
  { dataSources, res }: Context,
) => {
  return await dataSources.usersDataSource.createUser({ userData }, res)
}

const updateProfile = async (
  _,
  { userUpdateProfile }: UserUpdateProfileInput,
  { dataSources, userIsLoggedIn, res }: Context,
) => {
  if (!userIsLoggedIn)
    throw new AppError(
      'Você precisa fazer login para acessar esse recurso.',
      'BAD_REQUEST',
    )

  const userDataUpdated = await dataSources.usersDataSource.updateProfile(
    { userUpdateProfile },
    { userIsLoggedIn },
  )

  res.setHeader('Set-Cookie', [
    `authToken=${userDataUpdated.token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
    `refresh_token=${userDataUpdated.refresh_token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
  ])

  return userDataUpdated
}

const deleteProfile = async (
  _,
  __,
  { dataSources, userIsLoggedIn, res }: Context,
) => {
  if (!userIsLoggedIn)
    throw new AppError(
      'Você precisa fazer login para acessar esse recurso.',
      'BAD_REQUEST',
    )

  res.setHeader('Set-Cookie', [
    `authToken=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    `refresh_token=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  ])

  return await dataSources.usersDataSource.deleteProfile(
    userIsLoggedIn.user_email,
  )
}

export const usersResolvers = {
  Mutation: { sign, createUser, updateProfile, deleteProfile },
}

// CRIAR O MODEL E MUTATIONS DE TASKS: https://chat.openai.com/c/1c1f9023-211b-49da-898e-17187cec37ab
