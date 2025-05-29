import { CollectionSlug } from 'payload'
import { ActiveRecord, CastFunction } from './base'
import { Post as PostType } from '@/payload-types'

export class Post extends ActiveRecord<PostType> {
  override collection: CollectionSlug = 'posts'
  override casts: Record<string, CastFunction<keyof PostType>> = {
    createdAt: (value: PostType['createdAt']) => {
      return new Date(value)
    },
  }
}
