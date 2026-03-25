import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="landing-page-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Blobs */}
      <div className="bg-blobs-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Navigation */}
      <nav className="glass-panel" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 100, 
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        height: '44px',
        padding: '0 20px',
        background: 'var(--surface)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}>
        <div style={{ width: '100%', maxWidth: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: 'var(--foreground)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--background)', fontSize: 12 }}>M</div>
            Miroko
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/pricing" style={{ fontSize: 12, fontWeight: 400, color: 'var(--foreground)', opacity: 0.8 }}>Pricing</Link>
            {user ? (
              <Link href="/dashboard" style={{ fontSize: 12, fontWeight: 400, color: 'var(--foreground)', opacity: 0.8 }}>Dashboard</Link>
            ) : (
              <Link href="/login" style={{ fontSize: 12, fontWeight: 400, color: 'var(--foreground)', opacity: 0.8 }}>Log in</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
        <h1 className="page-title animate-fade-in" style={{ fontSize: '72px', maxWidth: 900, marginBottom: 24, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
          The studio manager<br/>for modern producers.
        </h1>
        <p className="auth-subtitle animate-fade-in" style={{ fontSize: 24, maxWidth: 600, marginBottom: 48, lineHeight: 1.4, animationDelay: '0.1s' }}>
          Manage tasks, handle seamless payments, and communicate with your team in one beautiful workspace.
        </p>
        <div className="animate-fade-in" style={{ display: 'flex', gap: 16, animationDelay: '0.2s' }}>
           <Link href={user ? "/dashboard" : "/login"} className="btn btn-primary" style={{ fontSize: 17, padding: '16px 32px' }}>
             Get Started Free
           </Link>
           <Link href="/pricing" className="btn btn-secondary" style={{ fontSize: 17, padding: '16px 32px' }}>
             View Pricing
           </Link>
        </div>

        {/* Product Illustration */}
        <div className="animate-fade-in" style={{ marginTop: 80, width: '100%', maxWidth: 1200, padding: '0 20px', animationDelay: '0.3s' }}>
          <div className="glass-panel" style={{ padding: 8, borderRadius: 'var(--radius-xl)' }}>
            <Image 
              src="/product-illustration.png" 
              alt="Miroko Dashboard" 
              width={1600} 
              height={900} 
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', display: 'block' }} 
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 20px', background: 'var(--secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 48, letterSpacing: '-0.03em', marginBottom: 16 }}>Everything you need. <br/> Nothing you don't.</h2>
            <p className="auth-subtitle" style={{ fontSize: 20 }}>Designed specifically for the workflow of creative professionals.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            <div className="glass-panel" style={{ padding: 40, border: 'none', background: 'var(--background)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,113,227,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 style={{ fontSize: 24, marginBottom: 12 }}>Secure by default</h3>
              <p style={{ color: '#86868b', lineHeight: 1.5 }}>Enterprise-grade security powered by Supabase. Your data is encrypted and protected.</p>
            </div>

            <div className="glass-panel" style={{ padding: 40, border: 'none', background: 'var(--background)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,113,227,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 style={{ fontSize: 24, marginBottom: 12 }}>Task Management</h3>
              <p style={{ color: '#86868b', lineHeight: 1.5 }}>Assign tasks, track progress, and manage deliverables effortlessly with your producers.</p>
            </div>

            <div className="glass-panel" style={{ padding: 40, border: 'none', background: 'var(--background)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,113,227,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </div>
              <h3 style={{ fontSize: 24, marginBottom: 12 }}>Multiple Admins</h3>
              <p style={{ color: '#86868b', lineHeight: 1.5 }}>Easily manage and configure your team with multi-admin support in the Supabase backend.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 20px', borderTop: '1px solid var(--surface-border)', textAlign: 'center', color: '#86868b' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--foreground)', fontWeight: 500 }}>
            <div style={{ width: 24, height: 24, background: 'var(--foreground)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--background)', fontSize: 12 }}>M</div>
            Miroko
          </div>
          <p>© {new Date().getFullYear()} Miroko. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
             <Link href="/pricing" style={{ transition: 'color 0.2s', ':hover': { color: 'var(--foreground)' } }}>Pricing</Link>
             <Link href="/login" style={{ transition: 'color 0.2s', ':hover': { color: 'var(--foreground)' } }}>Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
