export const projectsTypedefs = `#graphql
  extend type Mutation {
    createProject(projectData: CreateProjectInput!): Project!
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
`
// [] Mutation para criar um novo projeto.
// [] Mutation para atualizar informações do projeto, como nome, descrição, prazos, etc.
// [] Mutation para adicionar membros à equipe de um projeto.
// [] Mutation para remover membros da equipe de um projeto.
// [] Mutation para excluir um projeto.
