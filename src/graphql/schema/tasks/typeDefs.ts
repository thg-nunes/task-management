export const tasksTypeDefs = `#graphql

  extend type Mutation {
    createTaskToProject(createTaskToProjectData: CreateTaskToProjectInput!): Task!
    updateTaskOfProject(updateTaskInput: UpdateTaskInput!): UpdateTaskOfProjectResponse!
    deleteTaskOfProject(task_id: String!): Boolean!
  }

  enum TaskStatus {
    EM_PROGRESSO
    FINALIZADA
  }

  enum TaskPriority {
    Alta
    Media
    Baixa
    Urgente
  }

  type GetTasksOfProjectResponse {
    title: String!
    description: String!
    status: TaskStatus!
    priority: TaskPriority!
  }

  type Task {
    id: String!
    title: String!
    description: String!
    status: TaskStatus!
    priority: TaskPriority!
    due_date: String!
    comments: [Comment!]!
    project_id: String!
    assigned_to_id: String!
    created_at: String!
    updated_at: String!
    created_by_id: String!
  }

  input CreateTaskToProjectInput {
    title: String!
    description: String!
    status: TaskStatus!
    priority: TaskPriority!
    due_date: String!
    project_id: String!
    assigned_to_id: String!
  }

  type Comment {
    id: String!
    comment: String
    created_at: String!
    updated_at: String!
    user_id: String!
    task_id: String!
  }

  input UpdateTaskInput {
    task_id: String!
    title: String
    description: String
    status: TaskStatus
    priority: TaskPriority
    due_date: String
    assigned_to_id: String
  }

  
  type UpdateTaskOfProjectResponse {
    id: String!
    title: String!
    description: String!
    status: TaskStatus!
    priority: TaskPriority!
    due_date: String!
    project_id: String!
    assigned_to_id: String!
    created_at: String!
    updated_at: String!
    created_by_id: String!
  }

`
