import { passwordCompareHash, passwordHash } from '@utils/bcrypts'

import { PostgresDataSource } from '@dataSources/postgres'
import { CreateUserInput, UpdatePasswordInput, User } from './types'

type CreateUserData = Pick<CreateUserInput, 'userData'>

export interface UsersDataSourceServices {
  createUser({ userData }: CreateUserData): Promise<User>
  userByEmailExists(email: string): Promise<boolean>
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
    const usernameAlreadyExists = await this.db.users.findUnique({
      where: {
        email: userData.email,
      },
    })

    if (usernameAlreadyExists) {
      throw new Error(`O email "${userData.email}" já extá cadastrado.`)
    }

    const encryptedPassword = await passwordHash(userData.password)

    userData.password = encryptedPassword

    return await this.db.users.create({
      data: userData,
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
}
