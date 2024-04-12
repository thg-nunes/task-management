import { PostgresDataSource } from '@dataSources/postgres'

import {
  CreateTaskToProjectInput,
  OpenTaskFinishedInput,
  Task,
  UpdateTaskInput,
} from './types'
import { AppError } from '@utils/appError'

export interface TaskDataSourceMethods {
  // Mutation
  createTaskToProject(
    data: CreateTaskToProjectInput & { user_id: string },
  ): Promise<Task>

  updateTaskOfProject(
    data: UpdateTaskInput & { user_id: string },
  ): Promise<Omit<Task, 'comments'>>

  deleteTaskOfProject({
    task_id,
  }: {
    task_id: string
    user_id: string
  }): Promise<boolean>
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

  async updateTaskOfProject({
    updateTaskInput,
    user_id,
  }: UpdateTaskInput & { user_id: string }): Promise<Omit<Task, 'comments'>> {
    if (!updateTaskInput.task_id)
      throw new AppError(`O id da task é obrigatório.`, 'BAD_USER_INPUT')

    const taskExists = await this.db.tasks.findUnique({
      where: { id: updateTaskInput.task_id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        due_date: true,
        project_id: true,
        assigned_to_id: true,
        created_by_id: true,
        created_at: true,
        updated_at: true,
        project: {
          select: {
            members: {
              where: { user_id },
            },
          },
        },
      },
    })

    if (!taskExists)
      throw new AppError(
        `Task "${updateTaskInput.task_id}" não encontrada.`,
        'NOT_FOUND',
      )

    const keysToUpdate = Object.keys(updateTaskInput).filter(
      (inputData) => inputData !== 'task_id',
    )
    if (keysToUpdate.length === 0) return taskExists

    keysToUpdate.forEach((key) => {
      if (updateTaskInput[key] === '')
        throw new AppError(
          `O campo "${key}" não pode ser nulo.`,
          'BAD_USER_INPUT',
        )
    })

    const userExists = await this.db.users.findUnique({
      where: { id: updateTaskInput.assigned_to_id },
    })

    if (!userExists)
      throw new AppError(
        `Usuário "${updateTaskInput.assigned_to_id}" não encontrado.`,
        'NOT_FOUND',
      )

    if (
      taskExists.created_by_id !== user_id &&
      taskExists.project.members[0]?.user_id !== user_id
    )
      throw new AppError(`Você não pode fazer isso.`, 'BAD_REQUEST')

    delete updateTaskInput.task_id

    const updated_at = new Date()

    return await this.db.tasks.update({
      where: { id: taskExists.id },
      data: {
        ...updateTaskInput,
        updated_at,
      },
    })
  }

  async deleteTaskOfProject({
    task_id,
    user_id,
  }: {
    task_id: string
    user_id: string
  }): Promise<boolean> {
    if (!task_id)
      throw new AppError(`O task_id é obrigratório.`, 'BAD_USER_INPUT')

    const taskExists = await this.db.tasks.findUnique({
      where: { id: task_id },
      select: {
        created_by_id: true,
        project: {
          select: {
            members: { where: { user_id } },
          },
        },
      },
    })

    if (!taskExists)
      throw new AppError(`Task "${task_id}" não encontrada.`, 'NOT_FOUND')

    if (
      taskExists.project.members[0]?.user_id !== user_id &&
      taskExists.created_by_id !== user_id
    )
      throw new AppError(`Você não pode fazer essa operação.`, 'BAD_REQUEST')

    // deletar a task
    const taskDeleted = await this.db.tasks.delete({
      where: { id: task_id },
    })

    return !!taskDeleted.id
  }
}
