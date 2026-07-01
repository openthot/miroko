import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--background)' }}>

      {/* Top Banner */}
      <div style={{
        background: 'var(--foreground)',
        color: 'var(--background)',
        textAlign: 'center',
        padding: '12px 20px',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        The studio manager for modern producers
      </div>

      {/* Navigation */}
      <nav style={{
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        padding: '24px 40px',
        borderBottom: '1px solid var(--surface-border)',
        background: 'var(--background)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', color: 'var(--foreground)' }}>
            <img src="/logo.svg" alt="Miroko Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
             <Link href="/" style={{ opacity: 0.8 }}>Home</Link>
             <Link href="/pricing" style={{ opacity: 0.8 }}>Pricing</Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
          {user ? (
            <Link href="/dashboard" style={{ opacity: 0.8 }}>Dashboard</Link>
          ) : (
            <Link href="/login" style={{ opacity: 0.8 }}>Log in</Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 20px',
        textAlign: 'center',
        minHeight: '70vh'
      }}>
        <h1 className="animate-fade-in" style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          maxWidth: '900px',
          marginBottom: '24px'
        }}>
          Mental clarity and elevated workflows,<br />powered by Miroko.
        </h1>
        <p className="animate-fade-in" style={{
          fontSize: '18px',
          maxWidth: '600px',
          marginBottom: '48px',
          lineHeight: 1.5,
          opacity: 0.7,
          animationDelay: '0.1s'
        }}>
          Functional delights made by producers. Manage tasks, handle seamless payments, and communicate with your team in one beautiful workspace.
        </p>

        <div className="animate-fade-in" style={{ display: 'flex', gap: '16px', animationDelay: '0.2s' }}>
           <Link href={user ? "/dashboard" : "/login"} className="btn btn-primary">
             Get Started Free
           </Link>
           <Link href="/pricing" className="btn btn-secondary">
             View Pricing
           </Link>
        </div>
      </section>

      {/* Image / Ethos Section */}
      <section style={{ padding: '0 40px 120px 40px' }}>
        <div style={{
          width: '100%',
          height: '600px',
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          <img
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Minimal Studio Workspace"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            color: '#fff',
            maxWidth: '500px'
          }}>
             <h2 style={{ fontSize: '32px', fontWeight: 400, marginBottom: '16px' }}>Connecting you to a new level of care.</h2>
             <p style={{ opacity: 0.9, lineHeight: 1.5 }}>
               Tap into your best state of mind with us. The everyday ritual of functional management.
             </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '0 40px 120px 40px', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '16px' }}>Our Science</h2>
            <p style={{ fontSize: '18px', opacity: 0.7 }}>A new era of wellbeing made by a team of neuroscientists and functional health doctors harnessing plant technology.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '24px' }}>
               <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Secure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>Secure by default</h3>
            <p style={{ opacity: 0.7, fontSize: '15px', lineHeight: 1.5 }}>Enterprise-grade security powered by Supabase.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '24px' }}>
               <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Task Management" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>Task Management</h3>
            <p style={{ opacity: 0.7, fontSize: '15px', lineHeight: 1.5 }}>Assign tasks, track progress, and manage deliverables.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '24px' }}>
               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Network" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>Community Network</h3>
            <p style={{ opacity: 0.7, fontSize: '15px', lineHeight: 1.5 }}>Unlock the power of our exclusive producer network.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px',
        borderTop: '1px solid var(--surface-border)',
        color: 'var(--foreground)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '32px', height: '32px', color: 'var(--foreground)' }}>
               <img src="/logo.svg" alt="Miroko Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
             </div>
             <span style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px' }}>Miroko</span>
          </div>

          <div style={{ display: 'flex', gap: '32px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
             <Link href="/">Home</Link>
             <Link href="/pricing">Pricing</Link>
             <Link href="/login">Log in</Link>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '40px auto 0', textAlign: 'center', fontSize: '12px', opacity: 0.5 }}>
          © {new Date().getFullYear()} Miroko. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}
