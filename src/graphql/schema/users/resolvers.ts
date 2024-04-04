import { Context } from '@context/types'
import { CreateUserInput, UpdatePasswordInput } from './types'

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
  Mutation: { createUser, updatePassword },
}
