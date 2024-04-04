import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

import { prisma } from '@services/prisma'

export class PostgresDataSource {
  protected db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor() {
    this.db = prisma
  }
}
