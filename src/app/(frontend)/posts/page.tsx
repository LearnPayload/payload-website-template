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
  const data = await model.post.getPaginatedPosts()

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
          currentPage={data.page}
          limit={12}
          totalDocs={data.totalDocs}
        />
      </div>

      <CollectionArchive posts={data.docs} />

      <div className="container">
        {data.totalPages > 1 && data.page && (
          <Pagination page={data.page} totalPages={data.totalPages} />
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
