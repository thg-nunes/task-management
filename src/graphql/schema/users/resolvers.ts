import { Context } from '@context/types'
import {
  CreateUserInput,
  SignInput,
  SignResponse,
  UserUpdateProfileInput,
} from './types'
import { AppError } from '@utils/appError'
import { userIsAuthenticated } from '@utils/jwt'

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
  { dataSources, req, res }: Context,
) => {
  const _userIsAuthenticated = userIsAuthenticated(req.headers.cookie)
  if (!_userIsAuthenticated)
    throw new AppError(
      'Você precisa fazer login para acessar esse recurso.',
      'FORBIDDEN',
    )

  const userDataUpdated = await dataSources.usersDataSource.updateProfile(
    { userUpdateProfile },
    { userIsLoggedIn: _userIsAuthenticated },
  )

  res.setHeader('Set-Cookie', [
    `authToken=${userDataUpdated.token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
    `refresh_token=${userDataUpdated.refresh_token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
  ])

  return userDataUpdated
}

const deleteProfile = async (_, __, { dataSources, req, res }: Context) => {
  const _userIsAuthenticated = userIsAuthenticated(req.headers.cookie)
  if (!_userIsAuthenticated)
    throw new AppError(
      'Você precisa fazer login para acessar esse recurso.',
      'FORBIDDEN',
    )

  res.setHeader('Set-Cookie', [
    `authToken=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    `refresh_token=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  ])

  return await dataSources.usersDataSource.deleteProfile(
    _userIsAuthenticated.user_email,
  )
}

export const usersResolvers = {
  Mutation: { sign, createUser, updateProfile, deleteProfile },
}
