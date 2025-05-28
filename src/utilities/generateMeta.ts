import type { Metadata } from 'next'

import type { Media, Page as PageType, Post as PostType, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { Post } from '@/models/post-model'
import { Page } from '@/models/page-model'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: { doc: Page | Post | null }): Promise<Metadata> => {
  const { doc } = args

  if (!doc) return {}

  const ogImage = getImageURL(doc?.data?.meta?.image)

  const title = doc?.data?.meta?.title
    ? doc?.data?.meta?.title + ' | Payload Website Template'
    : 'Payload Website Template'

  return {
    description: doc?.data?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.data?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.data?.slug) ? doc?.data?.slug.join('/') : '/',
    }),
    title,
  }
}
