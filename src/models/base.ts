// base.ts
import { CollectionSlug, getPayload, PaginatedDocs, SelectType, Where } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { Options } from 'node_modules/payload/dist/collections/operations/local/find'
import { SelectFromCollectionSlug } from 'node_modules/payload/dist/collections/config/types'
// TODO: find,findOrFail,findMany,findOrCreate,create,update,upsert,delete

interface BasePaginatedDocs<T> extends Omit<PaginatedDocs<T>, 'docs'> {
  docs: RecordCollection<T>
}

export type CastFunction<V> = (value: V) => any

export abstract class ActiveRecord<T> {
  abstract collection: CollectionSlug
  protected casts: Record<keyof T, CastFunction<any>> | null = null
  private attributes: T | null = null

  setAttributes(data: T): typeof this {
    this.attributes = data
    this.castAttributes()
    return this
  }

  getAttributes() {
    return this.attributes
  }

  castAttributes() {
    if (!this.attributes) return
    if (this.casts === null) return
    Object.keys(this.attributes!).map((a) => {
      if (!this.casts![a as keyof T] || !this.attributes) return
      const key = a as keyof T
      const value = this.get(key)
      this.attributes[key] = this.casts![key](value)
    })
  }

  get<K extends keyof T>(key: K): T[K] {
    if (!this.attributes) {
      throw new Error('attributes have not been set')
    }
    return this.attributes[key]
  }

  private async getClient() {
    return await getPayload({ config })
  }

  async find(id: string | number): Promise<T> {
    const client = await this.getClient()
    const result = (await client.findByID({
      collection: this.collection,
      id,
    })) as T

    return result
  }

  findMany = cache(
    async (options: Omit<Options<CollectionSlug, SelectType>, 'collection'> = {}) => {
      const client = await this.getClient()
      const results = (await client.find({
        ...options,
        collection: this.collection,
      })) as PaginatedDocs<T>

      return {
        ...results,
        docs: new RecordCollection(results.docs).hydrate(this),
      }
    },
  )
}

class RecordCollection<T> {
  constructor(private docs: T[]) {}
  records: ActiveRecord<T>[] = []

  hydrate(instance: ActiveRecord<T>): typeof this {
    console.log(this.docs)
    this.records = this.docs.map((d: T) => {
      const clone = new (instance.constructor as { new (): ActiveRecord<T> })()
      clone.setAttributes(d)
      return clone
    })
    return this
  }

  toArray(): T[] {
    return [...(this.records.map((r) => r.getAttributes()) as T[])]
  }

  toJson(): string {
    return JSON.stringify(this.records, null, 2)
  }

  first(): ActiveRecord<T> {
    return this.records.at(0) as ActiveRecord<T>
  }

  count(): number {
    return this.records.length
  }

  each(callbackfn: (value: ActiveRecord<T>, index: number, array: ActiveRecord<T>[]) => void) {
    return this.records.forEach(callbackfn)
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const key in this.records) {
      if (this.records && this.records.hasOwnProperty(key)) {
        yield this.records[key] as T
      }
    }
  }
}
