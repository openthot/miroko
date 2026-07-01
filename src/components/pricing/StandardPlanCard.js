export default function StandardPlanCard({ profile }) {
  return (
    <div className="glass-panel" style={{ padding: 48, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Standard Access</h2>
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Free</div>
      <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>Default access to the Soundwave Music Group platform.</p>

      <button className="btn btn-secondary" disabled style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500, opacity: 0.5, cursor: 'not-allowed' }}>
        {profile?.tier === 'standard' ? 'Current Plan' : 'Included'}
      </button>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>What&apos;s included:</div>
        <ul style={{ listStyle: 'none', gap: 12, display: 'flex', flexDirection: 'column', color: '#86868b' }}>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Up to 2 projects per month
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Access to assigned pipeline tasks
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Standard support
          </li>
        </ul>
      </div>
    </div>
  )
}
