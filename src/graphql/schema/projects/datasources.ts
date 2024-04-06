import { PostgresDataSource } from '@dataSources/postgres'

import { AppError } from '@utils/appError'

import {
  CreateProjectInput,
  CreateProjectMemberErrorResponse,
  CreateProjectMemberSuccessResponse,
  Project,
  RemoveMemberOfProjectInpt,
  RemoveMemberOfProjectResponse,
} from './types'

export interface PostgresDataSourceMethods {
  createProject(
    { projectData }: CreateProjectInput,
    user_id: string,
  ): Promise<Project>

  createProjectMember(data: {
    project_id: string
    user_id: string
  }): Promise<
    CreateProjectMemberSuccessResponse | CreateProjectMemberErrorResponse
  >
  removeMemberOfProject(
    data: RemoveMemberOfProjectInpt & {
      userLoggedId: string
    },
  ): Promise<RemoveMemberOfProjectResponse>
}

export class ProjectsDataSource
  extends PostgresDataSource
  implements PostgresDataSourceMethods
{
  constructor() {
    super()
  }

  async createProject(
    { projectData }: CreateProjectInput,
    user_id: string,
  ): Promise<Project> {
    if (!Object.keys(projectData).length)
      throw new AppError('Você não pode criar um projeto vazio.')

    const requiredFields = ['name', 'description']
    for (const key in projectData) {
      if (requiredFields.includes(key) && projectData[key] === '') {
        throw new AppError(`O campo ${key} é obrigatório e Não pode ser nulo.`)
      }
    }

    const projectNameAlreadyExists = await this.db.projects.findUnique({
      where: {
        author_id_name: {
          author_id: user_id,
          name: projectData.name,
        },
      },
    })

    if (projectNameAlreadyExists)
      throw new AppError(`Um projeto com o mesmo nome já foi criado.`)

    return await this.db.projects.create({
      data: {
        ...projectData,
        author: {
          connect: {
            id: user_id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        start_date: true,
        observations: true,
        started: true,
        delivery_date: true,
        status: true,
        category: true,
        created_at: true,
        updated_at: true,
        members: true,
        author_id: true,
      },
    })
  }

  async createProjectMember({
    user_id,
    project_id,
  }: {
    user_id: string
    project_id: string
  }): Promise<
    CreateProjectMemberErrorResponse | CreateProjectMemberSuccessResponse
  > {
    const userAlreadyMemberOfProject =
      await this.db.userMemberOfProjects.findFirst({
        where: { project_id, user_id },
      })

    if (userAlreadyMemberOfProject)
      return {
        project_id,
        message: 'Você já é membro desse projeto',
      }

    await this.db.userMemberOfProjects.create({
      data: {
        user_id,
        project_id,
      },
    })

    const allMembersOfProject = await this.db.userMemberOfProjects.findMany({
      where: { project_id },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    return { usersMembersList: allMembersOfProject }
  }

  async removeMemberOfProject({
    removeMemberOfProjectData,
    userLoggedId,
  }: RemoveMemberOfProjectInpt & {
    userLoggedId: string
  }): Promise<RemoveMemberOfProjectResponse> {
    const requiredFields = ['member_id', 'project_id']

    for (const key in removeMemberOfProjectData) {
      if (
        requiredFields.includes(key) &&
        removeMemberOfProjectData[key] === ''
      ) {
        throw new AppError(`O campo ${key} não pode ser nulo.`)
      }
    }

    // verificar se o projeto a ser deletado existe
    const projectExists = await this.db.userMemberOfProjects.findFirst({
      where: {
        project_id: removeMemberOfProjectData.project_id,
        user_id: removeMemberOfProjectData.member_id,
      },
      select: {
        project: {
          select: {
            author_id: true,
          },
        },
      },
    })

    if (!projectExists)
      throw new AppError(
        `O projeto "${removeMemberOfProjectData.project_id}" não existe.`,
        'BAD_REQUEST',
      )

    // verificar se o usuario logado é dono do projeto
    if (projectExists.project.author_id !== userLoggedId)
      throw new AppError(
        `Você não tem autorização para fazer isso.`,
        'BAD_REQUEST',
      )

    // deletar membro
    const memberDeleted = await this.db.userMemberOfProjects.delete({
      where: {
        user_id_project_id: {
          user_id: removeMemberOfProjectData.member_id,
          project_id: removeMemberOfProjectData.project_id,
        },
      },
    })

    return {
      removed: !!memberDeleted.user_id,
      member_id: memberDeleted.user_id,
    }
  }
}
