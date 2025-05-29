import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import React from 'react'
import PageClient from './page.client'
import { model } from '@/models'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const posts = await model.post.findMany()
  console.log({ posts })
  for (const doc of posts.docs) {
    console.log(doc)
  }

  posts.docs.each((d) => {
    console.log(d.get('createdAt'))
  })
  const docs = posts.docs.toArray()
  const firstPost = posts.docs.first()!

  console.log({ firstPost: firstPost.get('createdAt') })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
