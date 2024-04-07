import { User } from '@schema/users/types'

export type Project = {
  id: string
  name: string
  description: string
  start_date: Date | null
  created_at: Date | null
  updated_at: Date | null
  observations: string | null
  started: boolean | null
  delivery_date: Date | null
  status: string | null
  members: ProjectMembers[]
  category: string | null
  author_id: string
}

export type ProjectMembers = {
  user_id: string
  project_id: string
}

export type CreateProjectInput = {
  projectData: {
    name: string
    description: string
    start_date?: Date
    observations?: string
    started?: boolean
    delivery_date?: Date
    status?: string
    category?: string
  }
}

enum CreateProjectStatus {
  CONCLUIDO = 'CONCLUIDO',
  EM_PROGRESSO = 'EM_PROGRESSO',
  FINALIZADO = 'FINALIZADO',
}

export type CreateProjectMemberErrorResponse = {
  message: string
  project_id: string
}

export type CreateProjectMemberSuccessResponse = {
  usersMembersList: {
    user: Omit<User, 'token' | 'refresh_token'>
  }[]
}

export type RemoveMemberOfProjectInpt = {
  removeMemberOfProjectData: {
    member_id: string
    project_id: string
  }
}

export type RemoveMemberOfProjectResponse = {
  removed: boolean
  member_id: string
}

export type DeleteProjectResponse = {
  status: 'SUCCESS' | 'ERROR'
  project_id: string
}

export type UpdateProjectDataInput = {
  updateProjectData: {
    id: string
    name?: string
    description?: string
    start_date?: Date
    observations?: string
    started?: boolean
    delivery_date?: Date
    status?: CreateProjectStatus
    category?: string
  }
}
