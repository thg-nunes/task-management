import { Context } from '@context/types'
import { CreateProjectInput } from './types'
import { AppError } from '@utils/appError'

export const createProject = async (
  _,
  { projectData }: CreateProjectInput,
  { dataSources, userIsLoggedIn }: Context,
) => {
  if (!userIsLoggedIn) throw new AppError('User_id é necessário.', 'FORBIDDEN')

  return await dataSources.projectsDataSource.createProject(
    { projectData },
    userIsLoggedIn.user_id,
  )
}

export const projectsResolvers = {
  Mutation: { createProject },
}
