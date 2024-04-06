export const projectsTypedefs = `#graphql
  extend type Mutation {
    createProject(projectData: CreateProjectInput!): Project!
    createProjectMember(project_id: String!): CreateProjectMemberResponse!
  }

  type Project {
    id: String!
    name: String!
    description: String!
    start_date: String
    observations: String
    started: Boolean
    delivery_date: String
    status: String
    category: String
    members: [ProjectMembers]
    author_id: String!
  }

  type ProjectMembers {
    user_id: String!
    project_id: String!
  }

  input CreateProjectInput {
    name: String!
    description: String!
    start_date: String
    observations: String
    started: Boolean
    delivery_date: String
    status: String
    category: String
  }

  type CreateProjectMemberErrorResponse {
    message: String!
    project_id: String!
  }

  type CreateProjectMemberSuccessResponse {
    usersMembersList: [ProjectMembersList!]!
  }

  type ProjectMembersList {
    user:  User!
  }

  union CreateProjectMemberResponse = CreateProjectMemberSuccessResponse | CreateProjectMemberErrorResponse
`
// [x] Mutation para criar um novo projeto.
// [] Mutation para atualizar informações do projeto, como nome, descrição, prazos, etc.
// [x] Mutation para adicionar membros à equipe de um projeto.
// [] Mutation para remover membros da equipe de um projeto.
// [] Mutation para excluir um projeto.
// [] Mutation para ver todos os membros de um projeto.
