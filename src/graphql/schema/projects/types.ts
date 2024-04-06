import { User } from '@schema/users/types'

export type Project = {
  id: string
  name: string
  description: string
  start_date: Date | null
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

export type CreateProjectMemberErrorResponse = {
  message: string
  project_id: string
}

export type CreateProjectMemberSuccessResponse = {
  usersMembersList: {
    user: Omit<User, 'token' | 'refresh_token'>
  }[]
}
