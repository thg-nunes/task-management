import { Context } from '@context/types'
import { CreateTaskToProjectInput, Task } from './types'
import { userIsAuthenticated } from '@utils/jwt'

// Mutation Resolvers
const createTaskToProject = async (
  _,
  { createTaskToProjectData }: CreateTaskToProjectInput,
  { dataSources, req }: Context,
): Promise<Task> => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return dataSources.taskDataSource.createTaskToProject({
    createTaskToProjectData,
    user_id,
  })
}

export const tasksResolvers = {
  Mutation: { createTaskToProject },
}
