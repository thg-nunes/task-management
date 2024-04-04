import bcrypt from 'bcrypt'

import { PostgresDataSource } from '@dataSources/postgres'
import { CreateUserInput } from './types'

type CreateUserData = Pick<CreateUserInput, 'userData'>

export interface UsersDataSourceServices {
  createUser({ userData }: CreateUserData): Promise<any>
}

export class UsersDataSource
  extends PostgresDataSource
  implements UsersDataSourceServices
{
  private BCRYPT_SALT = 10

  constructor() {
    super()
  }

  async createUser({ userData }: CreateUserData): Promise<any> {
    const usernameAlreadyExists = await this.db.users.findUnique({
      where: {
        username: userData.username,
      },
    })

    if (usernameAlreadyExists) {
      throw new Error(`Username "${userData.username}" já existe, use outro.`)
    }

    const encryptedPassword = await bcrypt.hash(
      userData.password,
      this.BCRYPT_SALT,
    )

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
}
