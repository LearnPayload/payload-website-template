import configPromise from '@payload-config'
import { Options } from 'node_modules/payload/dist/collections/operations/local/find'
import { DataFromCollectionSlug, getPayload, PaginatedDocs, SelectType } from 'payload'
import { CollectionSlug } from 'payload'
import { cache } from 'react'

interface BaseDocument {
  id: string | number
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface BaseInstance<T, M> {
  new (data: T): M
  collectionSlug: CollectionSlug
}

interface BaseFindOptions extends Omit<Options<CollectionSlug, SelectType>, 'collection'> {}

type BasePaginatedModels<M> = PaginatedDocs & {
  models: M[]
}

export class BaseModel<T extends BaseDocument = BaseDocument> {
  static collectionSlug: CollectionSlug
  data: T

  constructor(data: T) {
    this.data = data
  }

  static client = async () => {
    return await getPayload({ config: configPromise })
  }

  private static _find = cache(
    async (
      self: BaseInstance<any, any>,
      options: BaseFindOptions,
    ): Promise<PaginatedDocs<DataFromCollectionSlug<CollectionSlug>>> => {
      const client = await BaseModel.client()
      const data = await client.find({
        collection: self.collectionSlug,
        ...options,
      })

      return data
    },
  )

  static async find<T extends BaseDocument = BaseDocument, M extends BaseModel<T> = BaseModel<T>>(
    this: BaseInstance<T, M>,
    id: string,
  ): Promise<M | null> {
    try {
      const data = await BaseModel._find(this, {
        where: { id: { equals: id } },
      })

      if (data.docs.length === 0) return null

      const first = new this(data.docs.at(0) as T)

      return first
    } catch (error) {
      // Handle error if needed
      return null
    }
  }

  static async getMany<
    T extends BaseDocument = BaseDocument,
    M extends BaseModel<T> = BaseModel<T>,
  >(this: BaseInstance<T, M>, options: BaseFindOptions): Promise<BasePaginatedModels<M>> {
    const results = await BaseModel._find(this, options)
    const models = results.docs.map((d) => new this(d as T))

    const data = { ...results, models } as BasePaginatedModels<M>
    return data
  }

  set<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value
    return this
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key]
  }
}
