import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role, onboarding_completed').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22h20L12 2z"/>
          </svg>
          Miroko
        </div>
        <nav className="nav-links">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          {isAdmin && (
            <Link href="/dashboard/users" className="nav-link">Users</Link>
          )}
          <Link href="/dashboard/notifications" className="nav-link">Notifications</Link>
          <Link href="/dashboard/tasks" className="nav-link">Tasks</Link>
          <Link href="/dashboard/statistics" className="nav-link">Statistics</Link>
          <Link href="/dashboard/payments" className="nav-link">Payments</Link>
          <Link href="/dashboard/awards" className="nav-link">Awards</Link>
        </nav>

        <div style={{ marginTop: 'auto', padding: '24px', fontSize: '13px', color: '#86868b', textAlign: 'center', borderTop: '1px solid var(--surface-border)' }}>
          Powered by <br />
          <strong style={{ color: 'var(--foreground)' }}>Lethal Labs</strong>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
