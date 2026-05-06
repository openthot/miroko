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
          <Link href="/dashboard/profile" className="nav-link">My Profile</Link>
          {isAdmin && (
            <Link href="/dashboard/users" className="nav-link">Users</Link>
          )}
          <Link href="/dashboard/network" className="nav-link">Network</Link>
          <Link href="/dashboard/notifications" className="nav-link">Notifications</Link>
          <Link href="/dashboard/tasks" className="nav-link">Tasks</Link>
          <Link href="/dashboard/statistics" className="nav-link">Statistics</Link>
          <Link href="/dashboard/payments" className="nav-link">Payments</Link>
          <Link href="/dashboard/awards" className="nav-link">Awards</Link>
          <Link href="/dashboard/support" className="nav-link">Support & Docs</Link>
        </nav>

        <div style={{ marginTop: 'auto', padding: '24px', fontSize: '13px', color: '#86868b', textAlign: 'center', borderTop: '1px solid var(--surface-border)' }}>
          Powered by <br />
          <strong style={{ color: 'var(--foreground)' }}>Lethal Labs</strong>
          <div style={{ marginTop: '12px' }}>
            <a href="https://github.com/openthot/miroko/commits/main" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              View Changelog
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
