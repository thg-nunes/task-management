import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { passwordCompareHash, passwordHash } from '@utils/bcrypts'

import { PostgresDataSource } from '@dataSources/postgres'
import {
  CreateAccountInput,
  SignInput,
  SignResponse,
  User,
  UserUpdateProfileInput,
} from './types'
import { createJWT } from '@utils/jwt'
import { UserIsLoggedIn } from '@schema/users/types'
import { AppError } from '@utils/appError'

type CreateAccountData = Pick<CreateAccountInput, 'userData'>

export interface UsersDataSourceMethods {
  getUser(email: string): Promise<User>
  getUsers(): Promise<Partial<Array<User>>>
  refreshToken(refresh_token: string): Promise<{
    token: string
    refresh_token: string
  }>
  deleteProfile(userId: string): Promise<boolean>
  batchLoadAvatarId(id: string): Promise<number[]>
  createAccount({ userData }: CreateAccountData): Promise<SignResponse>
  updateProfile(
    { userUpdateProfile }: UserUpdateProfileInput,
    { userIsLoggedIn }: { userIsLoggedIn: UserIsLoggedIn },
  ): Promise<User>
  signIn(signData: SignInput): Promise<SignResponse>
}

export class UsersDataSource
  extends PostgresDataSource
  implements UsersDataSourceMethods
{
  constructor() {
    super()
  }
  async getUser(email: string): Promise<Partial<User>> {
    const user = await this.db.users.findUnique({ where: { email: email } })
    if (!user)
      throw new AppError(`User "${email}" não encontrado.`, 'NOT_FOUND')

    return user
  }

  async getUsers(): Promise<Partial<Array<User>>> {
    return await this.db.users.findMany()
  }

  async createAccount({ userData }: CreateAccountData): Promise<SignResponse> {
    const requiredFields = ['username', 'email', 'password']

    for (const field of requiredFields) {
      if (!userData[field] || userData[field] === '')
        throw new AppError(
          `O campo ${field} é obrigatório e não pode ser nulo.`,
          'BAD_REQUEST',
        )
    }

    const emailAlreadyExists = await this.db.users.findUnique({
      where: { email: userData.email },
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
      select: { id: true },
    })

    const token = createJWT({ user_id: user.id })

    const refresh_token = createJWT(
      { user_id: user.id },
      {
        expiresIn: '10d',
      },
    )

    const userWithTokenAndRefreshToken = await this.db.users.update({
      where: { id: user.id },
      data: { token, refresh_token },
      select: {
        id: true,
        token: true,
        refresh_token: true,
        email: true,
        username: true,
      },
    })

    return { ...userWithTokenAndRefreshToken, avatarId: undefined }
  }

  async deleteProfile(userId: string) {
    const userDeleted = await this.db.users.delete({ where: { id: userId } })
    return !!userDeleted.id
  }

  async signIn({ signData }: SignInput): Promise<SignResponse> {
    const user = await this.db.users.findUnique({
      where: {
        email: signData.email,
      },
      select: {
        email: true,
        id: true,
        username: true,
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

    const avatar = await this.db.avatar.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    })

    const { email, id, refresh_token, token, username } = user

    if (avatar) {
      return { email, id, refresh_token, token, username, avatarId: avatar.id }
    }

    return { email, id, refresh_token, token, username }
  }

  async refreshToken(refresh_token: string): Promise<{
    token: string
    refresh_token: string
  }> {
    try {
      const { user_id } = jwt.verify(refresh_token, process.env.JWT_SECRET) as {
        user_id: string
      }

      const new_token = createJWT({ user_id })

      return await this.db.users.update({
        data: { token: new_token },
        where: { id: user_id },
        select: { token: true, refresh_token: true },
      })
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const { user_id, username } = jwt.verify(
          refresh_token,
          process.env.JWT_SECRET,
          {
            ignoreExpiration: true,
          },
        ) as {
          user_id: string
          username: string
        }

        const token = createJWT({ user_id })
        const _refresh_token = createJWT(
          { user_id, username },
          {
            expiresIn: '10d',
          },
        )

        return await this.db.users.update({
          data: { token, refresh_token: _refresh_token },
          where: { id: user_id },
          select: { token: true, refresh_token: true },
        })
      }
    }
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
      where: { id: userIsLoggedIn.user_id },
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

  private avatarIdLoader = this.createInstanceLoader<number[]>(async (ids) => {
    const _ids = ids as string[]
    const userAvatarId = await this.db.avatar.findMany({
      where: { user_id: { in: _ids } },
      select: { id: true },
    })

    return _ids.map((id) =>
      userAvatarId.filter((avatarId) => avatarId.id === parseInt(id)),
    )
  })

  batchLoadAvatarId(id: string): Promise<number[]> {
    return this.avatarIdLoader.load(id)
  }
}
