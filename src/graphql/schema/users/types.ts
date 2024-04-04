export type User = {
  id: string
  username: string
  email: string
  created_at: string
  updated_at: string
}

export type CreateUserInput = {
  userData: {
    username: string
    email: string
    password: string
  }
}
