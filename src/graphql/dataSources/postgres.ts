import DataLoader from 'dataloader'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

import { prisma } from '@services/prisma'

export class PostgresDataSource {
  protected db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor() {
    this.db = prisma
  }

  protected createInstanceLoader = <T>(
    batchLoaderCallback: (ids: string[]) => Promise<any>,
  ) => {
    return new DataLoader<string, T>(async (ids) => {
      const _ids = ids as string[]
      return await batchLoaderCallback(_ids.map((id) => id))
    })
  }
}
