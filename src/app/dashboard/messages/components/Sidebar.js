import Link from 'next/link'

export default function Sidebar({ isAdmin, search, recipient, recipients }) {
  return (
    <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Conversations</h2>
        {isAdmin && (
          <form action="" method="get">
            <input
              name="search"
              className="input-control"
              placeholder="Search producers..."
              defaultValue={search || ''}
              style={{ fontSize: '14px', padding: '10px' }}
            />
          </form>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <Link
          href="/dashboard/messages?recipient=all"
          style={{
            display: 'block', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '8px',
            background: recipient === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: recipient === 'all' ? '#fff' : 'inherit'
          }}
        >
          📢 Broadcast Channel
        </Link>

        <div style={{ color: '#86868b', fontSize: '12px', textTransform: 'uppercase', padding: '10px 12px', fontWeight: '600' }}>
          {isAdmin ? 'Producers' : 'Admins'}
        </div>

        {recipients?.map(r => (
          <Link
            key={r.id}
            href={`/dashboard/messages?recipient=${r.id}`}
            style={{
              display: 'block', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '4px',
              background: recipient === r.id ? 'var(--primary)' : 'transparent',
              color: recipient === r.id ? '#fff' : 'inherit',
              transition: 'all 0.2s'
            }}
          >
            {r.name || 'Unnamed'}
          </Link>
        ))}
      </div>
    </div>
  )
}
