import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch Stats
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true })
  const { count: pendingTaskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  const stats = [
    { label: 'Total Users', value: userCount || 0, icon: 'Users' },
    { label: 'Total Tasks', value: taskCount || 0, icon: 'Clipboard' },
    { label: 'Pending Tasks', value: pendingTaskCount || 0, icon: 'Clock' },
  ]

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="btn btn-secondary" type="submit">Sign Out</button>
        </form>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2>Welcome back, {user?.email}</h2>
        <p style={{ color: '#86868b', marginTop: '0.5rem' }}>
          This is your Miroko producer management portal. Here you can track tasks, send messages, and manage payments.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: '#86868b', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '600', letterSpacing: '-0.02em' }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

