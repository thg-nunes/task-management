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
import { UserIsLoggedIn } from '@schema/users/types'
import { AppError } from '@utils/appError'

type CreateUserData = Pick<CreateUserInput, 'userData'>

export interface UsersDataSourceMethods {
  getUser(user_id: string): Promise<User>
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
  implements UsersDataSourceMethods
{
  constructor() {
    super()
  }
  async getUser(user_id: string): Promise<Partial<User>> {
    const user = await this.db.users.findUnique({ where: { id: user_id } })
    if (!user)
      throw new AppError(`User "${user_id}" não encontrado.`, 'NOT_FOUND')

    return user
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
      throw new AppError(
        `O email "${userData.email}" já está cadastrado.`,
        'BAD_REQUEST',
      )
    }

    const encryptedPassword = await passwordHash(userData.password)

    userData.password = encryptedPassword

    const user = await this.db.users.create({
      data: { ...userData },
      select: {
        id: true,
        email: true,
        username: true,
        created_at: true,
        updated_at: true,
      },
    })

    const token = createJWT({ user_email: userData.email, user_id: user.id })

    const refresh_token = createJWT({
      user_email: userData.email,
      user_id: user.id,
    })

    await this.db.users.update({
      where: { id: user.id },
      data: { token, refresh_token },
    })

    return user
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

    if (!user) throw new AppError('Email ou senha incorreta.', 'NOT_FOUND')

    const passwordIsCorrect = await passwordCompareHash({
      password: signData.password,
      passwordHash: user.password,
    })

    if (!passwordIsCorrect)
      throw new AppError('Email ou senha incorreta.', 'NOT_FOUND')

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
      throw new AppError(
        'Você deve enviar algum valor para atualizar.',
        'BAD_USER_INPUT',
      )

    const fieldsToUpdate: string[] = []

    for (const key in userUpdateProfile) {
      if (
        userUpdateProfile[key] !== undefined &&
        userUpdateProfile[key] === ''
      ) {
        throw new AppError(
          `O campo "${key}" não pode ser nulo, envie um valor válido.`,
          'BAD_USER_INPUT',
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
