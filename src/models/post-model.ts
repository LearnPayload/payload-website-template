import { CollectionSlug } from 'payload'
import { BaseModel } from './base-model'
import { Post as PostType } from '@/payload-types'
import { draftMode } from 'next/headers'

export class Post extends BaseModel<PostType> {
  static override collectionSlug: CollectionSlug = 'posts'
  static async getPaginatedPosts() {
    const data = await this.getMany({
      depth: 1,
      limit: 12,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
      },
    })
    return data
  }

  static async getPostBySlug(slug: string) {
    const { isEnabled: draft } = await draftMode()
    const result = await this.getMany({
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.models?.[0] || null
  }
}
