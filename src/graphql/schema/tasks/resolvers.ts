import { Context } from '@context/types'
import { Task, CreateTaskToProjectInput, UpdateTaskInput } from './types'
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

const updateTaskOfProject = async (
  _,
  { updateTaskInput }: UpdateTaskInput,
  { dataSources, req }: Context,
): Promise<Omit<Task, 'comments'>> => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return dataSources.taskDataSource.updateTaskOfProject({
    updateTaskInput,
    user_id,
  })
}

export const tasksResolvers = {
  Mutation: { createTaskToProject, updateTaskOfProject },
}
