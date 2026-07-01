import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user?.id)
    .single()

  // Real-looking placeholder data for the prompt
  const stats = [
    { label: 'Active Tasks', value: '14', metric: 'sparkline' },
    { label: 'Pending Payments', value: '₹45,000', metric: 'currency' },
    { label: 'Active Producers', value: '8', metric: 'count' },
    { label: 'Unread Messages', value: '3', metric: 'count' },
  ]

  const activityFeed = [
    { id: 1, producer: 'Sarah Chen', task: 'Mix stems for Track 04', time: '2h ago', avatar: '1' },
    { id: 2, producer: 'Marcus Webb', task: 'Final mastering approval', time: '4h ago', avatar: '2' },
    { id: 3, producer: 'David K.', task: 'Upload vocal comps', time: '1d ago', avatar: '3' },
    { id: 4, producer: 'Lena Ray', task: 'Review beat licensing', time: '2d ago', avatar: '4' },
  ]

  const topProducers = [
    { id: 1, name: 'Sarah Chen', tasks: 12, status: 'Paid', avatar: '1' },
    { id: 2, name: 'Marcus Webb', tasks: 8, status: 'Pending', avatar: '2' },
    { id: 3, name: 'David K.', tasks: 5, status: 'Paid', avatar: '3' },
  ]

  const tasksToDo = [
    { id: 101, title: 'Export final stems', tag: 'High Priority' },
    { id: 102, title: 'Draft producer agreement', tag: 'Legal' },
  ]

  const tasksInProgress = [
    { id: 201, title: 'Mix stems for Track 04', tag: 'Mixing' },
    { id: 202, title: 'Review initial masters', tag: 'Mastering' },
  ]

  const tasksDone = [
    { id: 301, title: 'Record backup vocals', tag: 'Recording' },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Overview</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">+ Invite Producer</button>
          <button className="btn btn-primary">+ New Task</button>
        </div>
      </div>

      {/* Row 1 — Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="gh-card" style={{ padding: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>{stat.value}</div>
              {stat.metric === 'sparkline' && (
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <polyline points="0,20 10,15 20,18 30,10 40,12 50,5 60,0" fill="none" stroke="var(--accent-primary)" strokeWidth="2"/>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 — Recent Activity Feed */}
      <div className="gh-card" style={{ marginBottom: '32px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Recent Activity
            <span className="stat-counter-badge">4</span>
          </h2>
        </div>
        <div style={{ padding: '0 16px' }}>
          {activityFeed.map((activity, i) => (
            <div key={activity.id} className="timeline-item">
              <div className="timeline-avatar">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.avatar}`} alt={activity.producer} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600' }}>{activity.producer}</span>
                <span style={{ color: 'var(--text-muted)' }}>completed task</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{activity.task}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: 'auto' }}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3 — Two-column split */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left (60%): Task board */}
        <div style={{ flex: '1 1 60%', minWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px' }}>Task Board</h2>
            <Link href="/dashboard/tasks" style={{ fontSize: '12px' }}>View all tasks →</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="kanban-col">
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                To Do <span className="stat-counter-badge">{tasksToDo.length}</span>
              </div>
              {tasksToDo.map(task => (
                <div key={task.id} className="gh-card" style={{ padding: '12px', background: 'var(--bg-canvas)' }}>
                  <div style={{ fontWeight: '500', marginBottom: '8px' }}>{task.title}</div>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{task.tag}</span>
                </div>
              ))}
            </div>

            <div className="kanban-col">
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                In Progress <span className="stat-counter-badge">{tasksInProgress.length}</span>
              </div>
              {tasksInProgress.map(task => (
                <div key={task.id} className="gh-card" style={{ padding: '12px', background: 'var(--bg-canvas)' }}>
                  <div style={{ fontWeight: '500', marginBottom: '8px' }}>{task.title}</div>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{task.tag}</span>
                </div>
              ))}
            </div>

            <div className="kanban-col">
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                Done <span className="stat-counter-badge">{tasksDone.length}</span>
              </div>
              {tasksDone.map(task => (
                <div key={task.id} className="gh-card" style={{ padding: '12px', background: 'var(--bg-canvas)' }}>
                  <div style={{ fontWeight: '500', marginBottom: '8px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{task.title}</div>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>{task.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (40%): Top producers list */}
        <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px' }}>Top Producers</h2>
            <Link href="/dashboard/network" style={{ fontSize: '12px' }}>View network →</Link>
          </div>
          <div className="gh-card">
            <table>
              <thead>
                <tr>
                  <th>Producer</th>
                  <th>Tasks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topProducers.map(p => (
                  <tr key={p.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.avatar}`} alt={p.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: '500' }}>{p.name}</span>
                    </td>
                    <td>{p.tasks}</td>
                    <td>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: p.status === 'Paid' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        color: p.status === 'Paid' ? 'var(--accent-primary)' : 'var(--text-muted)'
                      }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
