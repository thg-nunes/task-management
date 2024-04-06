export const projectsTypedefs = `#graphql
  extend type Mutation {
    createProject(projectData: CreateProjectInput!): Project!
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

  input RemoveMemberOfProjectInpt {
    member_id: String!
    project_id: String!
  }

  type RemoveMemberOfProjectResponse {
    removed: Boolean!
    member_id: String!
  }

`
