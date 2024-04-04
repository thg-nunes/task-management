import { Context } from '@context/types'
import { CreateUserInput, UpdatePasswordInput } from './types'

// Query Resolvers
const userByEmailExists = async (
  _,
  { email }: { email: string },
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.userByEmailExists(email)
}

// Mutations Resolvers
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
  Mutation: { createUser, updatePassword },
}
