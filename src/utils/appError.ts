import { GraphQLError, GraphQLErrorOptions } from 'graphql'

type ErrorsCode = 'BAD_REQUEST' | 'BAD_USER_INPUT' | 'FORBIDDEN'

export class AppError extends GraphQLError {
  constructor(message: string, code?: ErrorsCode) {
    super(message, { extensions: { code } })
  }
}
