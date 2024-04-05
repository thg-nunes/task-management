import jwt from 'jsonwebtoken'
import { passwordCompareHash, passwordHash } from '@utils/bcrypts'

import { PostgresDataSource } from '@dataSources/postgres'
import {
  CreateUserInput,
  SignInput,
  SignResponse,
  UpdatePasswordInput,
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
  createUser({ userData }: CreateUserData): Promise<User>
  updateProfile(
    { userUpdateProfile }: UserUpdateProfileInput,
    { userIsLoggedIn }: { userIsLoggedIn: UserIsLoggedIn },
  ): Promise<User>
  userByEmailExists(email: string): Promise<boolean>
  sign(signData: SignInput): Promise<SignResponse>
  updatePassword({ updatePassword }: UpdatePasswordInput): Promise<boolean>
}

export class UsersDataSource
  extends PostgresDataSource
  implements UsersDataSourceServices
{
  constructor() {
    super()
  }

  async createUser({ userData }: CreateUserData): Promise<User> {
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

    const token = createJWT({ username: userData.username })

    const refresh_token = createJWT({ username: userData.username })

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

  async updatePassword({
    updatePassword,
  }: UpdatePasswordInput): Promise<boolean> {
    const userExists = await this.db.users.findUnique({
      where: { email: updatePassword.email },
      select: { password: true },
    })

    if (!userExists)
      throw new Error(`Usuário emeail "${updatePassword.email}" não existe.`)

    const passwordIsCorrect = await passwordCompareHash({
      password: updatePassword.old_password,
      passwordHash: userExists.password,
    })

    if (!passwordIsCorrect) {
      throw new Error('A senha que você mandou está incorreta.')
    }

    const encryptedPassword = await passwordHash(updatePassword.new_password)

    const passwordIsUpdate = await this.db.users.update({
      where: { email: updatePassword.email },
      data: { password: encryptedPassword },
    })

    return !!passwordIsUpdate.id
  }

  async userByEmailExists(email: string): Promise<boolean> {
    const user = await this.db.users.findFirst({ where: { email } })

    if (!user) throw new Error('Usuário informado não existe.')

    return !!user.email
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
        user_id: userIsLoggedIn.user_id,
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
