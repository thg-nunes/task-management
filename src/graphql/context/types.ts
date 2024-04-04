import { IncomingMessage, ServerResponse } from 'http'
import { UsersDataSourceServices } from '../schema/users/datasources'

export type Context = {
  res: ServerResponse<IncomingMessage>
  dataSources: {
    usersDataSource: UsersDataSourceServices
  }
}
