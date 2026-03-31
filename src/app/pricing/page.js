export default function PricingPage() {
  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', paddingBottom: 100 }}>
      {/* Navigation */}
      <nav style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <a href="/" style={{ fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>M</div>
          Miroko
        </a>
        <a href="/dashboard" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}>Back to Dashboard</a>
      </nav>

      <section style={{ maxWidth: 1000, margin: '0 auto', paddingTop: 40, paddingHorizontal: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 className="page-title" style={{ fontSize: 56, letterSpacing: '-0.04em', marginBottom: 16 }}>Unlock your full potential.</h1>
          <p className="auth-subtitle" style={{ fontSize: 22, maxWidth: 600, margin: '0 auto' }}>Upgrade to the Artist Tier or access features flexibly à la carte.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32, padding: '0 20px', marginBottom: 60 }}>
          
          {/* Standard Plan */}
          <div className="glass-panel" style={{ padding: 48, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Standard Access</h2>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Free</div>
            <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>Default access to the Soundwave Music Group platform.</p>
            
            <button className="btn btn-secondary" disabled style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500, opacity: 0.5, cursor: 'not-allowed' }}>
              Current Plan
            </button>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>What's included:</div>
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

          {/* Premium Plan */}
          <div className="glass-panel" style={{ padding: 48, display: 'flex', flexDirection: 'column', border: '2px solid var(--primary)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '4px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Artist Tier
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Premium</h2>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>$20<span style={{ fontSize: 20, color: '#86868b', fontWeight: 500 }}>/mo</span></div>
            <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>Maximum visibility, priority allocation, and enhanced privileges.</p>
            
            <a href="mailto:admin@soundwave.com?subject=Upgrade to Artist Tier" className="btn btn-primary" style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500, textAlign: 'center' }}>
              Upgrade Now
            </a>

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
        </div>

        {/* A La Carte Features */}
        <div className="glass-panel" style={{ padding: '40px', margin: '0 20px' }}>
          <h2 style={{ marginBottom: 24, fontSize: 28, letterSpacing: '-0.02em', textAlign: 'center' }}>À La Carte Feature Access</h2>
          <p style={{ textAlign: 'center', color: '#86868b', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}>Need a specific feature without the monthly commitment? Purchase privileges individually.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>$5</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Deadline Extension</div>
              <p style={{ fontSize: 13, color: '#86868b' }}>Add extra time to your current project stage without accumulating day-by-day penalties.</p>
            </div>
            
            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>$2</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Increased Capacity</div>
              <p style={{ fontSize: 13, color: '#86868b' }}>Increase your monthly cap to 5 projects for the current billing cycle.</p>
            </div>

            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>$1</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Project Withdrawal</div>
              <p style={{ fontSize: 13, color: '#86868b' }}>Mandatory fee if you fail to complete or choose to withdraw from an accepted project.</p>
            </div>

            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, borderBottomLeftRadius: 8 }}>POPULAR</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>$10</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Main Artist Credit</div>
              <p style={{ fontSize: 13, color: '#86868b' }}>Receive Main Artist placement on a single official release.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
