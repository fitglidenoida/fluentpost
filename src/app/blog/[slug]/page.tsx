import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

interface BlogPostPageProps {
  params: { slug: string }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const blogPost = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      topic: {
        select: {
          title: true,
          category: true,
        },
      },
    },
  })

  if (!blogPost) {
    notFound()
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: blogPost.id },
    data: { views: { increment: 1 } },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitGlide</h1>
                <p className="text-sm text-gray-500">Marketing Blog</p>
              </div>
            </div>
            <a
              href="/content"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Content Studio
            </a>
          </div>
        </div>
      </header>

      {/* Blog Post Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              {blogPost.topic && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {blogPost.topic.title}
                </span>
              )}
              <span className={`px-3 py-1 text-sm rounded-full ${
                blogPost.status === 'published' ? 'bg-green-100 text-green-800' :
                blogPost.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {blogPost.status}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {blogPost.title}
            </h1>
            
            {blogPost.excerpt && (
              <p className="text-lg text-gray-600 mb-6">
                {blogPost.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Views: {blogPost.views}</span>
              <span>Shares: {blogPost.shares}</span>
              <span>Likes: {blogPost.likes}</span>
              <span>Created: {new Date(blogPost.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: blogPost.content
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
                  .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                  .replace(/# (.*?)(?=\n|$)/g, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
              }}
            />
          </div>

          {/* Footer */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>Viral Score: <span className="font-semibold">{blogPost.viralScore?.toFixed(1) || '0.0'}</span></p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Share
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Like
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
