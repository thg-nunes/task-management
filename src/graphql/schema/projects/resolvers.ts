import { Context } from '@context/types'
import { CreateProjectInput, RemoveMemberOfProjectInpt } from './types'
import { AppError } from '@utils/appError'

export const createProject = async (
  _,
  { projectData }: CreateProjectInput,
  { dataSources, req }: Context,
) => {
  const _userIsAuthenticated = userIsAuthenticated(req.headers.cookie)
  if (!_userIsAuthenticated)
    throw new AppError('User_id é necessário.', 'FORBIDDEN')

  return await dataSources.projectsDataSource.createProject(
    { projectData },
    _userIsAuthenticated.user_id,
  )
}

export const createProjectMember = async (
  _,
  { project_id }: { project_id: string },
  { dataSources, req }: Context,
) => {
  const _userIsAuthenticated = userIsAuthenticated(req.headers.cookie)
  if (!_userIsAuthenticated)
    throw new AppError('User_id é necessário.', 'FORBIDDEN')

  return await dataSources.projectsDataSource.createProjectMember({
    project_id,
    user_id: _userIsAuthenticated.user_id,
  })
}

export const removeMemberOfProject = async (
  _,
  { removeMemberOfProjectData }: RemoveMemberOfProjectInpt,
  { dataSources, req }: Context,
) => {
  const _userIsAuthenticated = userIsAuthenticated(req.headers.cookie)
  if (!_userIsAuthenticated)
    throw new AppError('User_id é necessário.', 'FORBIDDEN')

  return await dataSources.projectsDataSource.removeMemberOfProject({
    removeMemberOfProjectData,
    userLoggedId: _userIsAuthenticated.user_id,
  })
}

export const projectsResolvers = {
  Mutation: { createProject, createProjectMember, removeMemberOfProject },
  CreateProjectMemberResponse: {
    __resolveType: (object) => {
      if (object.usersMembersList) return 'CreateProjectMemberSuccessResponse'
      if (object.message) return 'CreateProjectMemberErrorResponse'
      return null
    },
  },
}
