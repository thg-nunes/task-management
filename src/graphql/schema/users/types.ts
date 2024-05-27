import { Project } from '@schema/projects/types'
import { Task } from '@schema/tasks/types'

export type User = Partial<{
  id: string
  username: string
  email: string
  token: string
  refresh_token: string
  created_at: Date
  updated_at: Date
  member_of_projects: Array<Project>
  author_of_projects: Array<Project>
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
  id: string
  username: string
  email: string
  token: string
  refresh_token: string
}

export type UserIsLoggedIn = {
  user_id: string
  user_email: string
}
