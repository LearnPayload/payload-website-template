// base.ts
import { CollectionSlug, getPayload, PaginatedDocs } from 'payload'
import config from '@payload-config'
// TODO: find,findOrFail,findMany,findOrCreate,create,update,upsert,delete

interface BasePaginatedDocs<T> extends Omit<PaginatedDocs<T>, 'docs'> {
  docs: RecordCollection<T>
}

export type CastFunction<V> = (value: V) => any

export abstract class ActiveRecord<T> {
  abstract collection: CollectionSlug
  abstract casts: Record<keyof T, CastFunction<any>>
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
    Object.keys(this.attributes!).map((a) => {
      if (!this.casts[a as keyof T] || !this.attributes) return
      const key = a as keyof T
      const value = this.get(key)
      this.attributes[key] = this.casts[key](value)
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

  async getMany(): Promise<BasePaginatedDocs<T>> {
    const client = await this.getClient()
    const results = (await client.find({
      collection: this.collection,
    })) as PaginatedDocs<T>

    console.log({ results })

    return {
      ...results,
      docs: new RecordCollection(results.docs).hydrate(this),
    }
  }

  // You can add more instance methods here later, like findById, create, update, delete etc.
  // For example:
  // async findById(id: string): Promise<T | undefined> { /* ... */ }
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

  *[Symbol.iterator](): Iterator<T> {
    for (const key in this.records) {
      if (this.records && this.records.hasOwnProperty(key)) {
        yield this.records[key] as T
      }
    }
  }
}
