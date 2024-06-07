import { Context } from '@context/types'
import { Task } from '@schema/tasks/types'
import {
  CreateAccountInput,
  SignInput,
  SignResponse,
  User,
  UserUpdateProfileInput,
} from './types'
import { returnsTokenAndRefreshToken, userIsAuthenticated } from '@utils/jwt'
import { Project } from '@schema/projects/types'

// Query Resolvers
const getUser = async (
  _,
  { email }: { email: string },
  { dataSources }: Context,
): Promise<User> => {
  return await dataSources.usersDataSource.getUser(email)
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
const signIn = async (
  _,
  { signData }: SignInput,
  { dataSources, res }: Context,
): Promise<SignResponse> => {
  const user = await dataSources.usersDataSource.signIn({
    signData,
  })
  res.setHeader('Set-Cookie', [
    `authToken=${user.token}; Domain=localhost:3000; Path=/; HttpOnly; SameSite=Strict`,
    `refresh_token=${user.refresh_token}; Domain=localhost:3000; Path=/; HttpOnly; SameSite=Strict`,
  ])

  return user
}

const refresh_token = async (
  _,
  __,
  { dataSources, req, res }: Context,
): Promise<boolean> => {
  const { refresh_token } = returnsTokenAndRefreshToken(req.headers.cookie)
  const { token, refresh_token: new_refresh_toke } =
    await dataSources.usersDataSource.refreshToken(refresh_token)

  res.setHeader('Set-Cookie', [
    `authToken=${token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
    `refresh_token=${new_refresh_toke}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
  ])

  return !!token
}

const createAccount = async (
  _,
  { userData }: CreateAccountInput,
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.createAccount({ userData })
}

const updateProfile = async (
  _,
  { userUpdateProfile }: UserUpdateProfileInput,
  { dataSources, req, res }: Context,
) => {
  // COMEÇAR A TRABALHAR NO UPDATE PROFILE
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
    _userIsAuthenticated.user_id,
  )
}

// Field Resolvers
const tasks = async (
  { id }: User,
  __,
  { dataSources, req }: Context,
): Promise<Task[]> => {
  userIsAuthenticated(req.headers.cookie)
  return dataSources.taskDataSource.batchLoadTasks<Promise<Task[]>>(id)
}

const member_of_projects = async (
  { id }: User,
  __,
  { dataSources, req }: Context,
): Promise<Project[]> => {
  userIsAuthenticated(req.headers.cookie)
  return dataSources.projectsDataSource.batchLoadMemberOfProjects(id)
}

const author_of_projects = async (
  { id }: User,
  __,
  { dataSources, req }: Context,
): Promise<Project[]> => {
  userIsAuthenticated(req.headers.cookie)
  return dataSources.projectsDataSource.batchLoadAuthorOfProjects(id)
}

export const usersResolvers = {
  Query: { getUser, getUsers },
  Mutation: {
    signIn,
    refresh_token,
    createAccount,
    updateProfile,
    deleteProfile,
  },
  User: { tasks, member_of_projects, author_of_projects },
}
