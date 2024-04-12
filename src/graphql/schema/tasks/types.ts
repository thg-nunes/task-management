export type GetTasksOfProjectResponse = {
  title: string
  description: string
  status: string
  priority: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: Date
  comments: Array<Comment>
  project_id: string
  assigned_to_id: string
  created_by_id: string
  created_at: Date
  updated_at: Date
}

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

export type Comment = {
  id: string
  comment?: string
  created_at: Date
  updated_at: Date
  user_id: string
  task_id: string
}

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

// essa aqui é pra commitar depois da updateTask toda testada e commitada
export type UpdateTaskAssignedToUserInput = {
  updateTaskAssignedToUserInput: {
    task_id: string
    assigned_to_id: string
  }
}

// essa aqui é pra commitar depois da UpdateTaskAssignedToUserInput toda testada e commitada
export type OpenTaskFinishedInput = {
  openTaskFinishedInput: {
    task_id: string
    priority: string | undefined
    status: string
  }
}
