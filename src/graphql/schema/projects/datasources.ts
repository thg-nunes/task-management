import { PostgresDataSource } from '@dataSources/postgres'
import { CreateProjectInput, Project } from './types'
import { AppError } from '@utils/appError'

export interface PostgresDataSourceMethods {
  createProject(
    { projectData }: CreateProjectInput,
    user_id: string,
  ): Promise<Project>
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
}
