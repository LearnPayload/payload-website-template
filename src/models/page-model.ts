import { CollectionSlug } from 'payload'
import { BaseModel } from './base-model'
import { Page as PageType } from '@/payload-types'

export class Page extends BaseModel<PageType> {
  static override collectionSlug: CollectionSlug = 'pages'
}
