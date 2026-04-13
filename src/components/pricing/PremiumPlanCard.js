export default function PremiumPlanCard({ profile, loadingFeature, handlePayment }) {
  return (
    <div className="glass-panel" style={{ padding: 48, display: 'flex', flexDirection: 'column', border: '2px solid var(--primary)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '4px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Artist Tier
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Premium</h2>
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>₹1600<span style={{ fontSize: 20, color: '#86868b', fontWeight: 500 }}>/mo</span></div>
      <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>Maximum visibility, priority allocation, and enhanced privileges.</p>

      <button
        onClick={() => handlePayment(1600, 'premium_tier')}
        disabled={loadingFeature || profile?.tier === 'premium'}
        className="btn btn-primary"
        style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500, textAlign: 'center' }}
      >
        {loadingFeature === 'premium_tier' ? 'Processing...' : (profile?.tier === 'premium' ? 'Currently Active' : 'Upgrade via UPI/Card')}
      </button>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Artist Tier Benefits:</div>
        <ul style={{ listStyle: 'none', gap: 12, display: 'flex', flexDirection: 'column' }}>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Designation as Main Artist on official releases
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Full exemption from delay penalties
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Up to 5 projects per month
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Access to the complete project catalogue
          </li>
        </ul>
      </div>
    </div>
  )
}
