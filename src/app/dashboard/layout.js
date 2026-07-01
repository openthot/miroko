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
      {/* GitHub Top Navbar */}
      <header className="gh-topnav">
        <div className="gh-topnav-left">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-primary)" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22h20L12 2z"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: '16px' }}>Miroko</span>
          </Link>
          <div className="gh-search">
            <input type="text" placeholder="Search producers, tasks, payments..." />
            <kbd>⌘K</kbd>
          </div>
        </div>
        <div className="gh-topnav-right">
          {/* Notifications bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-primary)">
              <path d="M8 16a2 2 0 001.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 008 16z"></path>
              <path fillRule="evenodd" d="M8 1.5A3.5 3.5 0 004.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.018.018 0 00-.003.01l.001.006c0 .002.002.004.004.006a.017.017 0 00.006.004l.007.001h10.964l.007-.001a.016.016 0 00.006-.004.016.016 0 00.004-.006l.001-.007a.017.017 0 00-.003-.01l-1.703-2.554a1.75 1.75 0 01-.294-.97V5A3.5 3.5 0 008 1.5zM3 5a5 5 0 0110 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.518 1.518 0 0113.482 13H2.518a1.518 1.518 0 01-1.263-2.36l1.703-2.554A.25.25 0 003 7.947V5z"></path>
            </svg>
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent-blue)', color: '#fff', fontSize: '10px', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </div>
          {/* Avatar dropdown */}
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--border-subtle)', cursor: 'pointer', overflow: 'hidden' }}>
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <nav className="nav-links">
            <Link href="/dashboard" className="nav-link active">
              <span style={{ fontSize: '16px' }}>🏠</span> Overview
            </Link>
            <Link href="/dashboard/tasks" className="nav-link">
              <span style={{ fontSize: '16px' }}>✅</span> Tasks
            </Link>
            <Link href="/dashboard/messages" className="nav-link">
              <span style={{ fontSize: '16px' }}>💬</span> Messages
            </Link>
            <Link href="/dashboard/payments" className="nav-link">
              <span style={{ fontSize: '16px' }}>💳</span> Payments
            </Link>
            <Link href="/dashboard/network" className="nav-link">
              <span style={{ fontSize: '16px' }}>👥</span> Producers
            </Link>
            <Link href="/dashboard/feed" className="nav-link">
              <span style={{ fontSize: '16px' }}>📡</span> Feed
            </Link>
            <Link href="/dashboard/profile" className="nav-link">
              <span style={{ fontSize: '16px' }}>⚙️</span> Settings
            </Link>
            {isAdmin && (
              <Link href="/dashboard/users" className="nav-link">
                <span style={{ fontSize: '16px' }}>🛡️</span> Users (Admin)
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
