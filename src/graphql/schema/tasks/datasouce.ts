import { PostgresDataSource } from '@dataSources/postgres'

import {
  Comment,
  CreateTaskToProjectInput,
  OpenTaskFinishedInput,
  Task,
  TasksOfUserInput,
  UpdateTaskInput,
} from './types'
import { AppError } from '@utils/appError'

export interface TaskDataSourceMethods {
  // Query
  getTasksOfProject(
    project_id: string,
  ): Promise<Pick<Task, 'title' | 'description' | 'status' | 'priority'>[]>
  getTaskDetails(project_id: string)
  getTaskComments(task_id: string): Promise<Comment[]>
  getTasksOfUser(
    data: TasksOfUserInput & {
      loggedUserId: string
    },
  ): Promise<Array<Task>>
  batchLoadTasks<T>(id: string): Promise<Task[]>
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

  updateTaskToFinished(data: {
    updateTaskInput: {
      task_id: string
      status: string
      priority: string
    }
    user_id: string
  }): Promise<Omit<Task, 'comments'>>

  openTaskFinished(
    data: OpenTaskFinishedInput & { user_id: string },
  ): Promise<Omit<Task, 'comments'>>
}

export class TaskDataSource
  extends PostgresDataSource
  implements TaskDataSourceMethods
{
  constructor() {
    super()
  }

  // Query DataSources
  async getTasksOfProject(
    project_id: string,
  ): Promise<Pick<Task, 'title' | 'description' | 'status' | 'priority'>[]> {
    if (!project_id)
      throw new AppError('O id do projeto é obrigatório.', 'BAD_USER_INPUT')

    const projectExists = await this.db.tasks.findMany({
      where: { project_id },
      select: {
        title: true,
        description: true,
        status: true,
        priority: true,
      },
    })

    if (!projectExists.length)
      throw new AppError(
        `O projeto "${project_id}" não foi encontrado.`,
        'NOT_FOUND',
      )

    return projectExists
  }

  async getTaskDetails(project_id: string) {
    const projectExists = await this.db.tasks.findMany({
      where: { project_id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        due_date: true,
        comments: {
          select: {
            comment: true,
            createdBy: {
              select: {
                username: true,
                created_at: true,
              },
            },
          },
        },
        assigned_to: {
          select: {
            username: true,
            email: true,
          },
        },
        project_id: true,
        updated_at: true,
        project: {
          select: {
            name: true,
            observations: true,
            start_date: true,
            delivery_date: true,
            description: true,
            category: true,
            members: {
              select: {
                user: {
                  select: {
                    email: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        assigned_to_id: true,
        created_at: true,
        created_by_id: true,
      },
    })

    if (!projectExists.length)
      throw new AppError(
        `O projeto "${project_id}" não foi encontrado.`,
        'NOT_FOUND',
      )

    return projectExists
  }

  async getTaskComments(task_id: string): Promise<Comment[]> {
    return await this.db.comments.findMany({
      where: { task_id },
    })
  }

  async getTasksOfUser({
    loggedUserId,
    tasksOfUserInput: { project_id, user_id },
  }: TasksOfUserInput & {
    loggedUserId: string
  }): Promise<Array<Task>> {
    const userLoggedIsMemberOrAuthorOfProject =
      await this.db.projects.findUnique({
        where: { id: project_id },
        select: {
          author_id: true,
          members: { where: { user_id: loggedUserId } },
        },
      })

    if (!userLoggedIsMemberOrAuthorOfProject)
      throw new AppError(`Projeto "${project_id}" não encontrado.`, 'NOT_FOUND')

    if (
      userLoggedIsMemberOrAuthorOfProject.author_id !== loggedUserId &&
      userLoggedIsMemberOrAuthorOfProject.members[0]?.user_id !== loggedUserId
    )
      throw new AppError(
        'Você não pode visualizar essas informações.',
        'BAD_REQUEST',
      )

    const tasks = await this.db.tasks.findMany({
      where: { assigned_to_id: user_id },
    })

    if (!tasks.length)
      throw new AppError(
        `Tasks do user "${user_id}" não encontradas.`,
        'NOT_FOUND',
      )

    return tasks
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
            user_id: createTaskToProjectData.assigned_to_id,
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
      include: {
        project: {
          include: {
            members: {
              where: { user_id },
              select: {
                user_id: true,
              },
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

  async updateTaskToFinished(data: {
    updateTaskInput: { task_id: string; status: string; priority: string }
    user_id: string
  }): Promise<Omit<Task, 'comments'>> {
    const taskExists = await this.db.tasks.findUnique({
      where: { id: data.updateTaskInput.task_id },
      select: {
        id: true,
        assigned_to_id: true,
        created_by_id: true,
        project: {
          include: {
            members: { where: { user_id: data.user_id } },
          },
        },
      },
    })

    if (!taskExists)
      throw new AppError(
        `Task "${data.updateTaskInput.task_id}" não encontrada.`,
        'NOT_FOUND',
      )

    if (
      data.user_id !== taskExists.created_by_id &&
      data.user_id !== taskExists.assigned_to_id &&
      data.user_id !== taskExists.project.members[0]?.user_id
    )
      throw new AppError('Você não pode fazer essa operação.', 'BAD_REQUEST')

    delete data.updateTaskInput.task_id

    return await this.db.tasks.update({
      where: { id: taskExists.id },
      data: { ...data.updateTaskInput },
    })
  }

  async openTaskFinished({
    user_id,
    openTaskFinishedInput,
  }: OpenTaskFinishedInput & { user_id: string }): Promise<
    Omit<Task, 'comments'>
  > {
    const taskExists = await this.db.tasks.findUnique({
      where: { id: openTaskFinishedInput.task_id },
      select: {
        id: true,
        status: true,
        created_by_id: true,
        project: { select: { members: { where: { user_id } } } },
      },
    })

    if (!taskExists)
      throw new AppError(
        `Task "${openTaskFinishedInput.task_id} não encontrada.`,
        'NOT_FOUND',
      )

    if (taskExists.status !== 'FINALIZADA')
      throw new AppError(
        `Task "${openTaskFinishedInput.task_id}" ainda está aberta.`,
        'BAD_REQUEST',
      )

    if (
      taskExists.created_by_id !== user_id &&
      taskExists.project.members[0]?.user_id !== user_id
    )
      throw new AppError('Você não pode realizar essa operação.')

    const updated_at = new Date()

    delete openTaskFinishedInput.task_id

    // atualizar o status da task
    return await this.db.tasks.update({
      where: { id: taskExists.id },
      data: {
        ...openTaskFinishedInput,
        updated_at,
      },
    })
  }

  // fields resolvers
  private tasksLoader = this.createInstanceLoader<Task[]>(async (ids) => {
    const _ids = ids as string[]
    const tasksOfUser = await this.db.tasks.findMany({
      where: { assigned_to_id: { in: _ids.map((id) => id) } },
    })
    const tasks: Task[] = tasksOfUser.map((task) => task as Task)
    return _ids.map((id) => tasks.filter((task) => task.assigned_to_id === id))
  })

  batchLoadTasks(id: string): Promise<Task[]> {
    return this.tasksLoader.load(id)
  }
}
