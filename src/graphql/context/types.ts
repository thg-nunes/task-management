import { IncomingMessage, ServerResponse } from 'http'
import { UsersDataSourceMethods } from '@schema/users/datasources'
import { PostgresDataSourceMethods } from '@schema/projects/datasources'
import { TaskDataSourceMethods } from '@schema/tasks/datasouce'

export type Context = {
  req: IncomingMessage
  res: ServerResponse<IncomingMessage>
  dataSources: {
    usersDataSource: UsersDataSourceMethods
    taskDataSource: TaskDataSourceMethods
    projectsDataSource: PostgresDataSourceMethods
  }
}
