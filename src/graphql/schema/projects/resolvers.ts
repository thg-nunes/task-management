import { Context } from '@context/types'
import { Task } from '@schema/tasks/types'
import { userIsAuthenticated } from '@utils/jwt'
import {
  CreateProjectInput,
  Project,
  UpdateProjectDataInput,
  RemoveMemberOfProjectInpt,
} from './types'

// Query Resolvers
const getProject = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
) => {
  userIsAuthenticated(req.headers.cookie)
  return await dataSources.projectsDataSource.getProject(project_id)
}

const getProjects = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
) => {
  userIsAuthenticated(req.headers.cookie)
  return await dataSources.projectsDataSource.getProjects()
}

const viewAllMembersOfProject = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
) => {
  userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.viewAllMembersOfProject(
    project_id,
  )
}

// Mutation Resolvers
export const createProject = async (
  _,
  { projectData }: CreateProjectInput,
  { dataSources, req }: Context,
) => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.createProject(
    { projectData },
    user_id,
  )
}

export const deleteProject = async (
  _,
  { project_id }: { project_id: string },
  { req, dataSources }: Context,
) => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.deleteProject({
    project_id,
    user_id,
  })
}

export const createProjectMember = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
) => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.createProjectMember({
    project_id,
    user_id,
  })
}

export const removeMemberOfProject = async (
  _,
  { removeMemberOfProjectData }: RemoveMemberOfProjectInpt,
  { dataSources, req }: Context,
) => {
  const { user_id: userLoggedId } = userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.removeMemberOfProject({
    removeMemberOfProjectData,
    userLoggedId,
  })
}

export const updateProject = async (
  _,
  { updateProjectData }: UpdateProjectDataInput,
  { dataSources, req }: Context,
): Promise<Project> => {
  const { user_id } = userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.updateProject({
    updateProjectData,
    user_id,
  })
}

// Field Resolvers
export const tasks = async (
  { id }: Project,
  _,
  { dataSources, req }: Context,
): Promise<Task[]> => {
  userIsAuthenticated(req.headers.cookie)

  return await dataSources.projectsDataSource.batchLoadTasksOfProject(id)
}

export const projectsResolvers = {
  Query: { viewAllMembersOfProject, getProject, getProjects },
  Mutation: {
    createProject,
    createProjectMember,
    removeMemberOfProject,
    deleteProject,
    updateProject,
  },
  Project: { tasks },
  CreateProjectMemberResponse: {
    __resolveType: (object) => {
      if (object.usersMembersList) return 'CreateProjectMemberSuccessResponse'
      if (object.message) return 'CreateProjectMemberErrorResponse'
      return null
    },
  },
}
