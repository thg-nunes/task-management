import { Context } from '@context/types'
import { Task } from '@schema/tasks/types'
import {
  CreateUserInput,
  SignInput,
  SignResponse,
  User,
  UserUpdateProfileInput,
} from './types'
import { userIsAuthenticated } from '@utils/jwt'

// Query Resolvers
const getUser = async (
  _,
  { user_id }: { user_id: string },
  { dataSources }: Context,
): Promise<User> => {
  return await dataSources.usersDataSource.getUser(user_id)
}

const getUsers = async (
  _,
  __,
  { dataSources, req }: Context,
): Promise<Array<User>> => {
  userIsAuthenticated(req.headers.cookie)
  return await dataSources.usersDataSource.getUsers()
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

const signOut = async (_, __, { res }: Context) => {
  res.setHeader('Set-Cookie', [
    `authToken=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict, Max-Age=0`,
    `refresh_token=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict, Max-Age=0`,
  ])

  return true
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

  res.setHeader('Set-Cookie', [
    `authToken=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    `refresh_token=''; Domain=localhost; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  ])

  return await dataSources.usersDataSource.deleteProfile(
    _userIsAuthenticated.user_email,
  )
}

// Field Resolvers
const tasks = async ({ id }: User, __, { dataSources, req }: Context) => {
  userIsAuthenticated(req.headers.cookie)
  return dataSources.taskDataSource.batchLoadTasks<Promise<Task[][]>>(id)
}

export const usersResolvers = {
  Query: { getUser, getUsers },
  Mutation: { sign, signOut, createUser, updateProfile, deleteProfile },
  User: { tasks },
}
