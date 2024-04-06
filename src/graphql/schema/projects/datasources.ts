import { PostgresDataSource } from '@dataSources/postgres'
import { CreateProjectInput, Project } from './types'
import { AppError } from '@utils/appError'

export interface PostgresDataSourceMethods {
  createProject({ projectData }: CreateProjectInput): Promise<Project>
}

export class ProjectsDataSource
  extends PostgresDataSource
  implements PostgresDataSourceMethods
{
  constructor() {
    super()
  }

  async createProject({ projectData }: CreateProjectInput): Promise<Project> {
    // verificar se tem algo enviado
    if (!Object.keys(projectData).length)
      throw new AppError('Você não pode criar um projeto vazio.')

    // verificar se os campos name e description não são = ''
    const requiredFields = ['name', 'description', 'author_id']
    for (const key in projectData) {
      if (requiredFields.includes(key) && projectData[key] === '') {
        throw new AppError(`O campo ${key} é obrigatório e Não pode ser nulo.`)
      }
    }

    // buscar um projeto do usuário com o mesmo nome
    const projectNameAlreadyExists = await this.db.projects.findFirst({
      where: { author_id: projectData.author_id, name: projectData.name },
    })

    if (projectNameAlreadyExists)
      throw new AppError(`Um projeto com o mesmo nome já foi criado.`)

    return await this.db.projects.create({
      data: projectData,
    })
  }
}
