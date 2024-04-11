import { PostgresDataSource } from '@dataSources/postgres'

import { CreateTaskToProjectInput, Task } from './types'
import { AppError } from '@utils/appError'

export interface TaskDataSourceMethods {
  // Mutation
  createTaskToProject(
    data: CreateTaskToProjectInput & { user_id: string },
  ): Promise<Task>
}

export class TaskDataSource
  extends PostgresDataSource
  implements TaskDataSourceMethods
{
  constructor() {
    super()
  }

  // Mutation DataSouces
  async createTaskToProject({
    createTaskToProjectData,
    user_id,
  }: CreateTaskToProjectInput & { user_id: string }): Promise<Task> {
    const requiredFieldsToCreateATask = [
      'title',
      'description',
      'status',
      'priority',
      'due_date',
      'project_id',
      'assigned_to_id',
    ]
    for (const key of requiredFieldsToCreateATask) {
      if (!createTaskToProjectData[key] || createTaskToProjectData[key] === '')
        throw new AppError(
          `O campo "${key}" é obrigatório não pode ser nulo.`,
          'BAD_USER_INPUT',
        )
    }

    const projectToAddTask = await this.db.projects.findUnique({
      where: { id: createTaskToProjectData.project_id },
      select: {
        name: true,
        author_id: true,
        members: {
          where: {
            user_id,
            OR: [{ user_id: createTaskToProjectData.assigned_to_id }],
          },
          select: { user_id: true },
        },
        tasks: {
          where: {
            title: createTaskToProjectData.title,
            AND: {
              description: createTaskToProjectData.description,
              project_id: createTaskToProjectData.project_id,
            },
          },
        },
      },
    })

    if (!projectToAddTask)
      throw new AppError(
        `O projeto "${createTaskToProjectData.project_id} não foi encontrado.`,
        'NOT_FOUND',
      )

    const currentDate = new Date()
    const sentDueDate = new Date(createTaskToProjectData.due_date)
    if (sentDueDate < currentDate)
      throw new AppError(
        'A data de entrega não pode ser menor que a data atual.',
        'BAD_REQUEST',
      )

    if (
      projectToAddTask.author_id !== user_id &&
      !projectToAddTask.members.find(({ user_id }) => user_id === user_id)
    )
      throw new AppError(
        `Você não pode adicionar task no projeto "${projectToAddTask.name}". Para isso, vire membro ou crie um.`,
        'BAD_REQUEST',
      )

    const userAssignedToTaskExists = await this.db.users.findUnique({
      where: { id: createTaskToProjectData.assigned_to_id },
    })

    if (!userAssignedToTaskExists)
      throw new AppError(
        `Usuário "${createTaskToProjectData.assigned_to_id}" não encontrado.`,
        'NOT_FOUND',
      )

    if (projectToAddTask.tasks.length > 0)
      throw new AppError(
        `A task de título: "${createTaskToProjectData.title}" e descrição: "${createTaskToProjectData.description}" já foi criada para o projeto "${projectToAddTask.name}".`,
        'BAD_REQUEST',
      )

    if (
      !projectToAddTask.members.find(
        ({ user_id }) => user_id === createTaskToProjectData.assigned_to_id,
      )
    ) {
      await this.db.userMemberOfProjects.create({
        data: {
          user_id: createTaskToProjectData.assigned_to_id,
          project_id: createTaskToProjectData.project_id,
        },
      })
    }

    return await this.db.tasks.create({
      data: {
        ...createTaskToProjectData,
        created_by_id: user_id,
        assigned_to_id: createTaskToProjectData.assigned_to_id,
        comments: {
          create: [],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        due_date: true,
        project_id: true,
        comments: true,
        created_by_id: true,
        assigned_to_id: true,
        created_at: true,
        updated_at: true,
      },
    })
  }
}