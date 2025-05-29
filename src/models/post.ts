import { CollectionSlug } from 'payload'
import { ActiveRecord, CastFunction } from './base'
import { Post as PostType } from '@/payload-types'
import { notFound } from 'next/navigation'

export class Post extends ActiveRecord<PostType> {
  override collection: CollectionSlug = 'posts'
  // override casts: Record<string, CastFunction<keyof PostType>> = {
  //   createdAt: (value: PostType['createdAt']) => {
  //     return new Date(value)
  //   },
  // }

  async findBySlug(
    slug: PostType['slug'],
    draft: boolean = false,
  ): Promise<ActiveRecord<PostType>> {
    const results = await this.findMany({
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

    if (results.totalDocs === 0) {
      notFound()
    }

    return results.docs.first()
  }
}
