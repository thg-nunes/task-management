import { Task } from '@schema/tasks/types'
import { User } from '@schema/users/types'

export type Project = Partial<{
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
  author: User
  author_id: string
  category: Array<string> | []
  tasks: Array<Task>
}>

export type ProjectMembers = Partial<{
  user_id: string
  user: User
  project_id: string
  project: Project
}>

export type CreateProjectInput = {
  projectData: {
    name: string
    description: string
    start_date?: Date | null
    observations?: string | null
    started?: boolean | null
    delivery_date?: Date | null
    status?: string | null
    category?: Array<string> | null
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
    user: User
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
    category?: Array<string>
  }
}
