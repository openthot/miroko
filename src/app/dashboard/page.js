import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

function Sparkline({ data, color = '#0071e3' }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 100
  const height = 30
  const step = width / (data.length - 1)
  
  const points = data.map((val, i) => {
    const x = i * step
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function StatCard({ label, value, trend, trendValue, sparkData, color }) {
  const isPositive = trend === 'up'
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: '#86868b', fontSize: '0.9rem', fontWeight: '500' }}>{label}</span>
        <div style={{ 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          color: isPositive ? '#34c759' : '#ff3b30', 
          background: isPositive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          padding: '2px 8px',
          borderRadius: '980px'
        }}>
          {isPositive ? '↑' : '↓'} {trendValue}%
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: '600', letterSpacing: '-0.02em' }}>{value}</span>
        <div style={{ marginBottom: '8px' }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
    
  const isAdmin = profile?.role === 'admin'

  // Fetch Stats
  const { count: producerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'producer')

  const { count: pendingTaskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Mocking "Active Projects" as unique task titles or just a count for demo
  const { data: tasksData } = await supabase.from('tasks').select('title')
  const uniqueTasks = new Set(tasksData?.map(t => t.title))
  const activeProjectsCount = uniqueTasks.size || 0

  // New Hires (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { count: newHiresCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'producer')
    .gt('created_at', thirtyDaysAgo.toISOString())

  // Mock historical data for sparklines (in a real app, this would be aggregated from DB)
  const stats = [
    { label: 'Total Producers', value: producerCount || 0, trend: 'up', trendValue: 12, sparkData: [10, 12, 11, 14, 13, 16, 15, 18], color: '#0071e3' },
    { label: 'Active Projects', value: activeProjectsCount || 0, trend: 'up', trendValue: 8, sparkData: [2, 3, 2, 4, 3, 5, 4, 5], color: '#ff2994' },
    { label: 'Ongoing Tasks', value: pendingTaskCount || 0, trend: 'down', trendValue: 5, sparkData: [20, 18, 19, 17, 18, 16, 15, 14], color: '#ff9500' },
    { label: 'New Hires', value: newHiresCount || 0, trend: 'up', trendValue: 24, sparkData: [0, 1, 0, 2, 1, 3, 2, 4], color: '#34c759' },
  ]

  // Admin Data
  let milestones = []
  let recentProducers = []
  let allProducers = []

  if (isAdmin) {
    // Milestones (Upcoming tasks with producer info)
    const { data: milestonesData } = await supabase
      .from('tasks')
      .select('title, status, profiles!producer_id(name)')
      .limit(5)
    milestones = milestonesData || []

    // Recent Producers
    const { data: recentData } = await supabase
      .from('profiles')
      .select('name, created_at')
      .eq('role', 'producer')
      .order('created_at', { ascending: false })
      .limit(5)
    recentProducers = recentData || []

    // All Producers
    const { data: allData } = await supabase
      .from('profiles')
      .select('id, name, created_at, payment_method')
      .eq('role', 'producer')
    allProducers = allData || []
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && <Link href="/dashboard/users" className="btn btn-secondary">Manage Users</Link>}
          <form action="/auth/signout" method="post">
            <button className="btn btn-secondary" type="submit">Sign Out</button>
          </form>
        </div>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2>Welcome back, {user?.email}</h2>
        <p style={{ color: '#86868b', marginTop: '0.5rem' }}>
          This is your Miroko producer management portal. {isAdmin ? 'You are logged in as an Administrator.' : 'You can track tasks, send messages, and manage payments.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {isAdmin && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Producer Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {milestones.length > 0 ? milestones.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{m.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#86868b' }}>Assigned to: {m.profiles?.name || 'Unassigned'}</div>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: m.status === 'completed' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                      color: m.status === 'completed' ? '#34c759' : '#ff9500',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {m.status}
                    </span>
                  </div>
                )) : <p style={{ color: '#86868b' }}>No upcoming milestones.</p>}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Recently Added Producers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentProducers.length > 0 ? recentProducers.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{p.name || 'Anonymous Producer'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#86868b' }}>Joined {new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }}></div>
                  </div>
                )) : <p style={{ color: '#86868b' }}>No recent producers found.</p>}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>All Producers</h3>
              <Link href="/dashboard/users" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>View All</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Payment Method</th>
                    <th>Joined Date</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducers.length > 0 ? allProducers.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name || 'N/A'}</td>
                      <td>{p.payment_method || 'None'}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={{ fontSize: '0.75rem', color: '#86868b', fontFamily: 'monospace' }}>{p.id}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#86868b', padding: '2rem' }}>No producers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

