import { model } from '@/models'

export default async function TestPage() {
  const posts = await model.post.getMany()

  return <pre>{JSON.stringify(posts, null, 2)}</pre>
}
