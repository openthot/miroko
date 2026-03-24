export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      {/* Navigation (Simple) */}
      <nav style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <a href="/" style={{ fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>M</div>
          Miroko
        </a>
        <a href="/" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}>Back to Home</a>
      </nav>

      <section style={{ maxWidth: 1000, margin: '0 auto', paddingTop: 60, paddingHorizontal: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }} className="animate-fade-in">
          <h1 className="page-title" style={{ fontSize: 56, letterSpacing: '-0.04em', marginBottom: 16 }}>Simple, transparent pricing.</h1>
          <p className="auth-subtitle" style={{ fontSize: 22, maxWidth: 600, margin: '0 auto' }}>Choose the option that works best for your studio.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32, padding: '0 20px' }}>
          {/* Open Source Plan */}
          <div className="glass-panel animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Open Source</h2>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Free</div>
            <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>Self-host Miroko on your own infrastructure.</p>
            
            <a href="https://github.com/openthot/miroko" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500 }}>
              View on GitHub
            </a>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>What's included:</div>
              <ul style={{ listStyle: 'none', gap: 12, display: 'flex', flexDirection: 'column' }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Full Source Code Access
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Unlimited Users
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Community Support
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Self-hosted Supabase Support
                </li>
              </ul>
            </div>
          </div>

          {/* Managed Plan */}
          <div className="glass-panel animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', animationDelay: '0.2s', border: '2px solid var(--primary)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '4px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Recommended
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Managed</h2>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Contact Us</div>
            <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>We handle the hosting, maintenance, and setup for you.</p>
            
            <a href="mailto:dramrxt@proton.me" className="btn btn-primary" style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500 }}>
              Get in Touch
            </a>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Everything in Open Source, plus:</div>
              <ul style={{ listStyle: 'none', gap: 12, display: 'flex', flexDirection: 'column' }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Fully Managed Hosting
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Priority 24/7 Support
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Custom Domain Setup
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Advanced Security Configurations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
