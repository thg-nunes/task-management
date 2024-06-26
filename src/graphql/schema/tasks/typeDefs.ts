// [] - Queries (Consultas):
// [] - Subscriptions (Assinaturas):
// [] - Assinar Tarefas Atualizadas: Subscription para receber notificações em tempo real sempre que uma tarefa for atualizada, adicionada ou excluída.
// [] - Assinar Tarefas Atribuídas ao Usuário: Subscription para receber notificações quando uma nova tarefa for atribuída ao usuário atual.
// [] - Implemente uma mutation que permita aos usuários reordenar as tarefas dentro de um projeto, alterando sua posição na lista.s

// Parte de Comentários:
// Mutation para adicionar um novo comentário a uma tarefa específica. Você precisará passar o conteúdo do comentário, o ID da tarefa à qual o comentário está associado e, opcionalmente, o ID do usuário que criou o comentário.
// Query para Listar Comentários:

// Query para recuperar uma lista de todos os comentários associados a uma determinada tarefa. Você precisará passar o ID da tarefa para obter os comentários correspondentes.
// Mutation para Excluir Comentário:

// Mutation para excluir um comentário específico de uma tarefa. Você precisará passar o ID do comentário que deseja excluir.

export const tasksTypeDefs = `#graphql
  extend type Query {
    getTasksOfProject(project_id: String!): [GetTasksOfProjectResponse!]!
    getTaskDetails(project_id: String!): [Task!]!
    getTasksOfUser(tasksOfUserInput: TasksOfUserInput!): [Task!]!
  }

  extend type Mutation {
    createTaskToProject(createTaskToProjectData: CreateTaskToProjectInput!): Task!
    updateTaskOfProject(updateTaskInput: UpdateTaskInput!): UpdateTaskOfProjectResponse!
    deleteTaskOfProject(task_id: String!): Boolean!
    updateTaskAssignedToUser(updateTaskAssignedToUserInput: UpdateTaskAssignedToUserInput!): Task!
    updateTaskToFinished(task_id: String!): UpdateTaskOfProjectResponse!
    openTaskFinished(openTaskFinishedInput: OpenTaskFinishedInput!): UpdateTaskOfProjectResponse!
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
    project: Project!
    project_id: String!
    assigned_to: User!
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
    createdBy: User
    task_id: String!
    task: Task
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

  input UpdateTaskAssignedToUserInput {
    task_id: String!
    assigned_to_id: String!
  }

  input OpenTaskFinishedInput {
    task_id: String!
    priority: TaskPriority
    status: TaskStatus!
  }

  input TasksOfUserInput {
    user_id: String!
    project_id: String!
  }
`
