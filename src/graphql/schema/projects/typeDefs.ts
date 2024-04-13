export const projectsTypedefs = `#graphql
  extend type Query {
    viewAllMembersOfProject(project_id: String!): ViewAllMembersOfProjectResponse
  }

  type ViewAllMembersOfProjectResponse {
    members: [ProjectMembersList!]!
  }


  extend type Mutation {
    createProject(projectData: CreateProjectInput!): Project!
    deleteProject(project_id: String!): DeleteProjectResponse
    updateProject(updateProjectData: UpdateProjectDataInput!): Project!
    createProjectMember(project_id: String!): CreateProjectMemberResponse!
    removeMemberOfProject(removeMemberOfProjectData: RemoveMemberOfProjectInpt): RemoveMemberOfProjectResponse!
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
    category: [String!]
    created_at: String
    updated_at: String
    members: [ProjectMembers]
    author: User
    author_id: String!
    tasks: [Task!]
  }

  type ProjectMembers {
    user_id: String!
    user: User
    project_id: String!
    project: Project
  }
  
  enum CreateProjectStatus {
    CONCLUIDO
    EM_PROGRESSO
    FINALIZADO
  }

  input UpdateProjectDataInput {
    id: String!
    name: String
    description: String
    start_date: String
    observations: String
    started: Boolean
    delivery_date: String
    status: CreateProjectStatus
    category: [String!]
  }

  input CreateProjectInput {
    name: String!
    description: String!
    start_date: String
    observations: String
    started: Boolean
    delivery_date: String
    status: CreateProjectStatus
    category: [String!]
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

  input RemoveMemberOfProjectInpt {
    member_id: String!
    project_id: String!
  }

  type RemoveMemberOfProjectResponse {
    removed: Boolean!
    member_id: String!
  }

  enum DeleteProjectStatusResponse {
    SUCCESS
    ERROR
  }

  type DeleteProjectResponse {
    status: DeleteProjectStatusResponse
    project_id: String!
  }

`
