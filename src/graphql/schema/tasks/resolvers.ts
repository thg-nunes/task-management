import { Context } from '@context/types'
import {
  Task,
  CreateTaskToProjectInput,
  UpdateTaskInput,
  UpdateTaskAssignedToUserInput,
} from './types'
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

const deleteTaskOfProject = async (
  _,
  { task_id }: { task_id: string },
  { dataSources, req }: Context,
) => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return dataSources.taskDataSource.deleteTaskOfProject({
    task_id,
    user_id,
  })
}

const updateTaskAssignedToUser = async (
  _,
  {
    updateTaskAssignedToUserInput: { task_id, assigned_to_id },
  }: UpdateTaskAssignedToUserInput,
  { dataSources, req }: Context,
): Promise<Omit<Task, 'comments'>> => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return dataSources.taskDataSource.updateTaskOfProject({
    updateTaskInput: {
      task_id,
      assigned_to_id,
    },
    user_id,
  })
}

export const tasksResolvers = {
  Mutation: {
    createTaskToProject,
    updateTaskOfProject,
    deleteTaskOfProject,
    updateTaskAssignedToUser,
  },
  Task: { comments },
}
