import { Comments, Projects } from '@prisma/client'
import { ProjectMembers } from '@schema/projects/types'
import { Task } from '@schema/tasks/types'

export type User = Partial<{
  id: string
  username: string
  email: string
  token?: string
  refresh_token?: string
  created_at: Date
  updated_at: Date
  projects_member: Array<ProjectMembers>
  projects_author: Array<Projects>
  comments_creted: Array<Comments>
  tasks: Array<Task>
}>

export type CreateUserInput = {
  userData: {
    username: string
    email: string
    password: string
  }
}

export type UserUpdateProfileInput = {
  userUpdateProfile: {
    email: string
    username: string
    password: string
  }
}

export type SignInput = {
  signData: {
    email: string
    password: string
  }
}

export type SignResponse = {
  token: string
  refresh_token: string
}

export type UserIsLoggedIn = {
  user_id: string
  user_email: string
}
