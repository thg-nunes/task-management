import { Project } from '@schema/projects/types'
import { User } from '@schema/users/types'

export type GetTasksOfProjectResponse = {
  title: string
  description: string
  status: string
  priority: string
}

export type Task = Partial<{
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: Date
  comments: Array<Comment>
  project: Project
  project_id: string
  assigned_to: User
  assigned_to_id: string
  created_by_id: string
  created_at: Date
  updated_at: Date
}>

export type CreateTaskToProjectInput = {
  createTaskToProjectData: {
    title: string
    description: string
    status: string
    priority: string
    due_date: string
    project_id: string
    assigned_to_id: string
  }
}

export type Comment = Partial<{
  id: string
  comment: string
  created_at: Date
  updated_at: Date
  user_id: string
  createdBy: User
  task_id: string
  task: Task
}>

export type UpdateTaskInput = {
  updateTaskInput: {
    task_id: string
    title?: string | undefined
    description?: string | undefined
    status?: string | undefined
    priority?: string | undefined
    due_date?: string | undefined
    assigned_to_id?: string | undefined
  }
}

export type UpdateTaskAssignedToUserInput = {
  updateTaskAssignedToUserInput: {
    task_id: string
    assigned_to_id: string
  }
}

export type OpenTaskFinishedInput = {
  openTaskFinishedInput: {
    task_id: string
    priority: string | undefined
    status: string
  }
}
