import DataLoader from 'dataloader'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

import { prisma } from '@services/prisma'

export class PostgresDataSource {
  protected db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor() {
    this.db = prisma
  }

  private instanceLoader = new DataLoader(async (ids) => {
    const _ids = ids as string[]
    return await this.batchLoaderCallback(_ids.map((id) => id))
  })

  batchLoad<T>(id: string) {
    return this.instanceLoader.load(id)
  }

  protected async batchLoaderCallback(ids: string[]) {
    return null
  }
}
