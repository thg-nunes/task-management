import { Context } from '@context/types'
import { CreateProjectInput } from './types'

export const createProject = async (
  _,
  { projectData }: CreateProjectInput,
  { dataSources }: Context,
) => {
  return await dataSources.projectsDataSource.createProject({ projectData })
}

export const projectsResolvers = {
  Mutation: { createProject },
}
