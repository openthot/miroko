import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Paywall from './components/Paywall'
import PostFeed from './components/PostFeed'
import UserList from './components/UserList'
import { FEATURE_PRICES } from '@/utils/pricing'

export const metadata = {
  title: 'Network | Miroko',
  description: 'Connect with other producers and artists on Miroko.',
}

export default async function NetworkPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role, social_unlocked')
    .eq('id', user.id)
    .single()

  const isUnlocked = profile?.social_unlocked || profile?.role === 'admin'

  return (
    <div className="network-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Community Network</h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!isUnlocked ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '24px' }}>
             <Paywall price={FEATURE_PRICES.social_unlock} user_id={user.id} />
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%' }}>
            <PostFeed currentUser={profile} />
            <UserList currentUser={profile} />
          </div>
        )}
      </div>
    </div>
  )
}
