import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function PostFeed({ currentUser }) {
  const supabase = await createClient()

  // Fetch recent posts and join with profiles to get the user's name
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles:user_id ( name )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  async function createPost(formData) {
    'use server'
    const content = formData.get('content')
    if (!content) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('posts').insert({
      user_id: user.id,
      content
    })

    revalidatePath('/dashboard/network')
  }

  return (
    <div className="post-feed" style={{ flex: 1, padding: '24px', maxWidth: '600px' }}>
      <form action={createPost} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          name="content"
          placeholder="What are you working on?"
          rows="3"
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', resize: 'none' }}
          required
        ></textarea>
        <button type="submit" className="button primary" style={{ alignSelf: 'flex-end' }}>Post</button>
      </form>

      <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {posts?.map(post => (
          <div key={post.id} className="post-card" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {post.profiles?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{post.profiles?.name || 'Unknown User'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, lineHeight: '1.5' }}>{post.content}</p>
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No posts yet. Be the first!</div>
        )}
      </div>
    </div>
  )
}
