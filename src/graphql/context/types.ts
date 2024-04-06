import { IncomingMessage, ServerResponse } from 'http'
import { UsersDataSourceMethods } from '@schema/users/datasources'
import { PostgresDataSourceMethods } from '@schema/projects/datasources'

export type Context = {
  res: ServerResponse<IncomingMessage>
  userIsLoggedIn?: UserIsLoggedIn
  dataSources: {
    usersDataSource: UsersDataSourceMethods
    projectsDataSource: PostgresDataSourceMethods
  }
}

export type UserIsLoggedIn = {
  user_id: string
  user_email: string
}
