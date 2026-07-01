import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function UserList({ currentUser }) {
  const supabase = await createClient()

  // Get all users who have unlocked social features (excluding current user)
  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('social_unlocked', true)
    .neq('id', currentUser.id)

  // Get current user's follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUser.id)

  const followingIds = new Set(follows?.map(f => f.following_id) || [])

  async function toggleFollow(formData) {
    'use server'
    const targetUserId = formData.get('userId')
    const isFollowing = formData.get('isFollowing') === 'true'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetUserId })
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
    }

    revalidatePath('/dashboard/network')
  }

  return (
    <div className="user-list" style={{ width: '300px', padding: '24px', borderLeft: '1px solid var(--surface-border)', backgroundColor: 'var(--surface)' }}>
      <h3 style={{ marginBottom: '20px' }}>Network</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {users?.map(user => {
          const isFollowing = followingIds.has(user.id)
          return (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {user.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.role}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                 <Link href={`/dashboard/messages?recipient=${user.id}`} className="button secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                   DM
                 </Link>
                <form action={toggleFollow}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="isFollowing" value={isFollowing.toString()} />
                  <button type="submit" className={`button ${isFollowing ? 'secondary' : 'primary'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </form>
              </div>
            </div>
          )
        })}
        {(!users || users.length === 0) && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No other users in the network yet.</div>
        )}
      </div>
    </div>
  )
}
