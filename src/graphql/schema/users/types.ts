export type User = {
  id: string
  username: string
  email: string
  created_at: Date
  updated_at: Date
}

export type CreateUserInput = {
  userData: {
    username: string
    email: string
    password: string
  }
}

export type UpdatePasswordInput = {
  updatePassword: {
    email: string
    old_password: string
    new_password: string
  }
}
