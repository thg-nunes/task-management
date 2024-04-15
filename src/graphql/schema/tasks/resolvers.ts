import { Context } from '@context/types'
import {
  Task,
  CreateTaskToProjectInput,
  UpdateTaskInput,
  Comment,
  OpenTaskFinishedInput,
  UpdateTaskAssignedToUserInput,
  TasksOfUserInput,
} from './types'
import { userIsAuthenticated } from '@utils/jwt'

const getTasksOfProject = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
): Promise<Pick<Task, 'title' | 'description' | 'status' | 'priority'>[]> => {
  userIsAuthenticated(req.headers.cookie)

  return await dataSources.taskDataSource.getTasksOfProject(project_id)
}

const getTaskDetails = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
) => {
  userIsAuthenticated(req.headers.cookie)

  return await dataSources.taskDataSource.getTaskDetails(project_id)
}

const comments = async (
  { id: task_id }: { id: string },
  _,
  { dataSources, req }: Context,
): Promise<Array<Comment>> => {
  userIsAuthenticated(req.headers.cookie)

  return await dataSources.taskDataSource.getTaskComments(task_id)
}

const getTasksOfUser = async (
  _,
  { tasksOfUserInput }: TasksOfUserInput,
  { req, dataSources }: Context,
) => {
  const { user_id: loggedUserId } = userIsAuthenticated(req.headers.cookie)

  return await dataSources.taskDataSource.getTasksOfUser({
    tasksOfUserInput,
    loggedUserId,
  })
}

const project = async ({ project_id }: Task, _, { dataSources }: Context) => {
  return await dataSources.projectsDataSource.getProject(project_id)
}

const assigned_to = async (
  { assigned_to_id }: Task,
  _,
  { dataSources }: Context,
) => {
  return await dataSources.usersDataSource.getUser(assigned_to_id)
}

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

const updateTaskToFinished = async (
  _,
  { task_id }: { task_id: string },
  { dataSources, req }: Context,
): Promise<Omit<Task, 'comments'>> => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return dataSources.taskDataSource.updateTaskToFinished({
    updateTaskInput: {
      task_id,
      status: 'FINALIZADA',
      priority: 'Baixa',
    },
    user_id,
  })
}

const openTaskFinished = async (
  _,
  { openTaskFinishedInput }: OpenTaskFinishedInput,
  { dataSources, req }: Context,
): Promise<Omit<Task, 'comments'>> => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return dataSources.taskDataSource.openTaskFinished({
    openTaskFinishedInput,
    user_id,
  })
}

export const tasksResolvers = {
  Query: { getTasksOfProject, getTaskDetails, getTasksOfUser },
  Mutation: {
    createTaskToProject,
    updateTaskOfProject,
    deleteTaskOfProject,
    updateTaskAssignedToUser,
    updateTaskToFinished,
    openTaskFinished,
  },
  Task: { comments, project, assigned_to },
}
