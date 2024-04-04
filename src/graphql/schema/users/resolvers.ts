import { Context } from '@context/types'
import { CreateUserInput } from './types'

const createUser = async (
  _,
  { userData }: CreateUserInput,
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.createUser({ userData })
}

export const usersResolvers = {
  Mutation: { createUser },
}
