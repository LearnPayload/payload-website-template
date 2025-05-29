// base.ts
import { CollectionSlug, getPayload, PaginatedDocs, SelectType, Where } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { Options } from 'node_modules/payload/dist/collections/operations/local/find'
// TODO: find,findOrFail,findMany,findOrCreate,create,update,upsert,delete

export type CastFunction<V> = (value: V) => any
interface BaseDocument {
  id: string | number
  createdAt?: string | Date
  updatedAt?: string | Date
}

function castDate(value: string) {
  return new Date(value)
}

export abstract class ActiveRecord<T extends BaseDocument = BaseDocument> {
  abstract collection: CollectionSlug
  protected casts: Record<string, CastFunction<any>> = {
    createdAt: castDate,
    updatedAt: castDate,
  }
  private attributes: T | null = null
  private dirtyFields: Record<string, boolean> = {}

  setAttributes(data: T): typeof this {
    this.attributes = data
    this.castAttributes()

    return this
  }

  getAttributes() {
    return this.attributes
  }

  async castAttributes() {
    const payloadConfig = await config
    const fields = payloadConfig.collections.find(
      (c) => c.slug === this.collection,
    )?.flattenedFields

    const dateFields = fields?.find((f) => f.type === 'date')
    console.log({
      dateFields,
    })
    if (!this.attributes) return
    if (this.casts === null) return
    Object.keys(this.attributes!).map((key) => {
      if (!this.casts![key] || !this.attributes) return
      const value = this.get(key as keyof T)
      this.attributes[key as keyof T] = this.casts![key](value)
    })
  }

  get isDirty() {
    console.log({ keys: Object.keys(this.dirtyFields).length > 0 })
    return Object.keys(this.dirtyFields).length > 0
  }

  get<K extends keyof T>(key: K): T[K] {
    if (!this.attributes) {
      throw new Error('attributes have not been set')
    }
    return this.attributes[key]
  }

  set<K extends keyof T>(key: K, value: NonNullable<T>[K]) {
    if (!this.attributes) {
      throw new Error('attributes have not been set')
    }
    const oldValue = this.attributes[key]
    if (oldValue === value) return
    this.dirtyFields[key as string] = true
    this.attributes[key] = value
  }

  private async getClient() {
    return await getPayload({ config })
  }

  async find(id: string | number): Promise<T> {
    const client = await this.getClient()
    const result = (await client.findByID({
      collection: this.collection,
      id,
      depth: 0,
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

  clone(): ActiveRecord<T> {
    return new (this.constructor as { new (): ActiveRecord<T> })()
  }

  /** CRUD */
  async create(data: Omit<T, 'id' | 'updatedAt' | 'createdAt'>): Promise<ActiveRecord<T>> {
    const client = await this.getClient()
    const createdData = (await client.create({
      collection: this.collection,
      data,
    })) as T

    const clone = this.clone()
    clone.setAttributes(createdData)

    return clone
  }

  async save(updates: Partial<Omit<T, 'id' | 'updatedAt' | 'createdAt'>>) {
    if (this.attributes === null) return this
    console.log(`Saving the ${this.collection} collection...`)
    const client = await this.getClient()
    const rawData = await this.find(this.attributes.id)
    const data = { ...rawData, ...updates } as Omit<T, 'id' | 'updatedAt' | 'createdAt'>
    console.log({ rawData })
    const updatedData = (await client.update({
      collection: this.collection,
      id: this.attributes.id,
      data,
    })) as T

    const clone = this.clone()
    clone.setAttributes(updatedData)

    return clone
  }
}

class RecordCollection<T extends BaseDocument = BaseDocument> {
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

  *[Symbol.iterator](): Iterator<ActiveRecord<T>> {
    for (const key in this.records) {
      if (this.records && this.records.hasOwnProperty(key)) {
        yield this.records[key] as ActiveRecord<T>
      }
    }
  }
}
