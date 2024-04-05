import { IncomingMessage, ServerResponse } from 'http'
import { UsersDataSourceServices } from '../schema/users/datasources'

export type Context = {
  res: ServerResponse<IncomingMessage>
  userIsLoggedIn?: UserIsLoggedIn
  dataSources: {
    usersDataSource: UsersDataSourceServices
  }
}

export type UserIsLoggedIn = {
  user_email: string
}
