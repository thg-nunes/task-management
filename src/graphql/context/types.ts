import { IncomingMessage, ServerResponse } from 'http'
import { UsersDataSourceMethods } from '@schema/users/datasources'
import { PostgresDataSourceMethods } from '@schema/projects/datasources'

export type Context = {
  req: IncomingMessage
  res: ServerResponse<IncomingMessage>
  dataSources: {
    usersDataSource: UsersDataSourceMethods
    projectsDataSource: PostgresDataSourceMethods
  }
}
