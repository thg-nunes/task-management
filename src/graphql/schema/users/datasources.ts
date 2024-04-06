import jwt from 'jsonwebtoken'
import { IncomingMessage, ServerResponse } from 'http'
import { passwordCompareHash, passwordHash } from '@utils/bcrypts'

import { PostgresDataSource } from '@dataSources/postgres'
import {
  CreateUserInput,
  SignInput,
  SignResponse,
  User,
  UserUpdateProfileInput,
} from './types'
import { createJWT } from '@utils/jwt'
import { UserIsLoggedIn } from '@context/types'

type CreateUserData = Pick<CreateUserInput, 'userData'>

export interface UsersDataSourceServices {
  refreshToken(refresh_token: string): Promise<{
    token: string
    refresh_token: string
  }>
  deleteProfile(userEmail: string): Promise<Boolean>
  createUser(
    { userData }: CreateUserData,
    res: ServerResponse<IncomingMessage>,
  ): Promise<User>
  updateProfile(
    { userUpdateProfile }: UserUpdateProfileInput,
    { userIsLoggedIn }: { userIsLoggedIn: UserIsLoggedIn },
  ): Promise<User>
  sign(signData: SignInput): Promise<SignResponse>
}

export class UsersDataSource
  extends PostgresDataSource
  implements UsersDataSourceServices
{
  constructor() {
    super()
  }

  async createUser(
    { userData }: CreateUserData,
    res: ServerResponse<IncomingMessage>,
  ): Promise<User> {
    const emailAlreadyExists = await this.db.users.findUnique({
      where: {
        email: userData.email,
      },
    })

    if (emailAlreadyExists) {
      throw new Error(`O email "${userData.email}" já extá cadastrado.`)
    }

    const encryptedPassword = await passwordHash(userData.password)

    userData.password = encryptedPassword

    const token = createJWT({ user_email: userData.email })

    const refresh_token = createJWT({ user_email: userData.email })

    res.setHeader('Set-Cookie', [
      `authToken=${token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
      `refresh_token=${refresh_token}; Domain=localhost; Path=/; HttpOnly; SameSite=Strict`,
    ])

    return await this.db.users.create({
      data: { ...userData, token, refresh_token },
      select: {
        id: true,
        email: true,
        username: true,
        created_at: true,
        updated_at: true,
      },
    })
  }

  async deleteProfile(email: string) {
    const userDeleted = await this.db.users.delete({ where: { email } })
    return !!userDeleted.id
  }

  async sign({ signData }: SignInput): Promise<SignResponse> {
    const user = await this.db.users.findUnique({
      where: {
        email: signData.email,
      },
      select: {
        password: true,
        token: true,
        refresh_token: true,
      },
    })

    if (!user) throw new Error('Email ou senha incorreta.')

    const passwordIsCorrect = await passwordCompareHash({
      password: signData.password,
      passwordHash: user.password,
    })

    if (!passwordIsCorrect) throw new Error('Email ou senha incorreta.')

    return {
      token: user.token,
      refresh_token: user.refresh_token,
    }
  }

  async refreshToken(refresh_token: string): Promise<{
    token: string
    refresh_token: string
  }> {
    const payload = jwt.verify(refresh_token, process.env.JWT_SECRET) as {
      user_id: string
      user_email: string
    }

    const { user_id, user_email } = payload

    const new_token = jwt.sign(
      { user_id, user_email },
      process.env.JWT_SECRET,
      {
        expiresIn: '5s', // expires in 5 seconds
      },
    )

    return await this.db.users.update({
      data: { token: new_token },
      where: { email: payload.user_email },
      select: { token: true, refresh_token: true },
    })
  }

  async updateProfile(
    { userUpdateProfile }: UserUpdateProfileInput,
    { userIsLoggedIn }: { userIsLoggedIn: UserIsLoggedIn },
  ): Promise<User> {
    if (!Object.keys(userUpdateProfile).length)
      throw new Error('Você deve enviar algum valor para atualizar.')

    const fieldsToUpdate: string[] = []

    for (const key in userUpdateProfile) {
      if (
        userUpdateProfile[key] !== undefined &&
        userUpdateProfile[key] === ''
      ) {
        throw new Error(
          `O campo "${key}" não pode ser nulo, envie um valor válido.`,
        )
      }

      fieldsToUpdate.push(key)
    }

    if (fieldsToUpdate.includes('password')) {
      userUpdateProfile.password = await passwordHash(
        userUpdateProfile.password,
      )
    }

    let updatedToken: string = ''

    if (fieldsToUpdate.includes('email')) {
      updatedToken = createJWT({
        user_email: userUpdateProfile.email,
      })
    }

    if (updatedToken !== '') {
      userUpdateProfile['token'] = updatedToken
    }

    userUpdateProfile['updated_at'] = new Date().toISOString()

    return await this.db.users.update({
      where: { email: userIsLoggedIn.user_email },
      data: userUpdateProfile,
      select: {
        id: true,
        username: true,
        email: true,
        token: true,
        refresh_token: true,
        created_at: true,
        updated_at: true,
      },
    })
  }
}
