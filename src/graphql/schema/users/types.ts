export type User = {
  id: string
  username: string
  email: string
  token?: string
  refresh_token?: string
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
