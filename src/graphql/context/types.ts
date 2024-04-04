import { UsersDataSourceServices } from '../schema/users/datasources'

export type Context = {
  dataSources: {
    usersDataSource: UsersDataSourceServices
  }
}
