import { login } from './actions'

export default async function LoginPage({ searchParams }) {
  // searchParams in newer Next.js versions can be accessed directly or awaited
  const sp = await searchParams || {}
  
  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card">
        <h1 className="auth-title">Welcome to Miroko</h1>
        <p className="auth-subtitle">Producer Management Portal</p>
        
        {sp.error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
            {sp.error}
          </div>
        )}
        {sp.message && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
            {sp.message}
          </div>
        )}
        
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input className="input-control" id="email" name="email" type="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input className="input-control" id="password" name="password" type="password" required />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} formAction={login}>Log In</button>
          </div>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '13px', color: '#86868b' }}>
          Powered by <strong style={{ color: 'var(--foreground)' }}>Lethal Labs</strong>
        </div>
      </div>
    </div>
  )
}
