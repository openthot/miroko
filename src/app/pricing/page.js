'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Script from 'next/script'

export default function PricingPage() {
  const [loadingFeature, setLoadingFeature] = useState(null)
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('id, tier, name').eq('id', user.id).single()
        setProfile({ ...data, email: user.email })
      }
    }
    loadUser()
  }, [])

  const handlePayment = async (amountInr, featureName) => {
    if (!profile) {
      setError('You must be logged in to purchase features.')
      return
    }
    
    setLoadingFeature(featureName)
    setError('')
    setMessage('')

    try {
      // 1. Create order on server
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInr, currency: 'INR', feature: featureName, user_id: profile.id })
      })
      const order = await res.json()

      if (order.error) {
        throw new Error(order.error)
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key_12345',
        amount: order.amount,
        currency: order.currency,
        name: 'Miroko / SMG',
        description: `Upgrade: ${featureName.replace('_', ' ')}`,
        order_id: order.mock ? undefined : order.id, 
        handler: async function (response) {
           // 3. Verify Payment
           const verifyRes = await fetch('/api/verify-payment', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               razorpay_order_id: response.razorpay_order_id || order.id, // fallback for mock
               razorpay_payment_id: response.razorpay_payment_id || 'pay_mock_999',
               razorpay_signature: response.razorpay_signature || 'mock_sig',
               user_id: profile.id,
               feature: featureName,
               amount: order.amount
             })
           })
           const verifyData = await verifyRes.json()
           if (verifyData.success) {
             setMessage(`Payment successful! Enjoy your new ${featureName.replace('_', ' ')}.`)
             if (featureName === 'premium_tier') setProfile(prev => ({ ...prev, tier: 'premium' }))
           } else {
             setError(verifyData.error || 'Payment verification failed.')
           }
        },
        prefill: {
          name: profile.name || '',
          email: profile.email || '',
        },
        theme: {
          color: '#ffffff'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response){
         setError(response.error.description || 'Payment Failed.')
      })
      rzp.open()
      
    } catch (err) {
      setError(err.message || 'Something went wrong initiating the payment.')
    } finally {
      setLoadingFeature(null)
    }
  }

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', paddingBottom: 100 }}>
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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
          <p className="auth-subtitle" style={{ fontSize: 22, maxWidth: 600, margin: '0 auto' }}>Upgrade to the Artist Tier or access features flexibly à la carte. Payments processed securely via Razorpay UPI & Cards.</p>
        </div>

        {message && <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '32px', textAlign: 'center', margin: '0 20px 32px 20px' }}>{message}</div>}
        {error && <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '32px', textAlign: 'center', margin: '0 20px 32px 20px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32, padding: '0 20px', marginBottom: 60 }}>
          
          {/* Standard Plan */}
          <div className="glass-panel" style={{ padding: 48, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Standard Access</h2>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Free</div>
            <p style={{ color: '#86868b', marginBottom: 32, minHeight: 48 }}>Default access to the Soundwave Music Group platform.</p>
            
            <button className="btn btn-secondary" disabled style={{ width: '100%', marginBottom: 32, padding: '16px', fontSize: 16, fontWeight: 500, opacity: 0.5, cursor: 'not-allowed' }}>
              {profile?.tier === 'standard' ? 'Current Plan' : 'Included'}
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
        </div>

        {/* A La Carte Features */}
        <div className="glass-panel" style={{ padding: '40px', margin: '0 20px' }}>
          <h2 style={{ marginBottom: 24, fontSize: 28, letterSpacing: '-0.02em', textAlign: 'center' }}>À La Carte Feature Access</h2>
          <p style={{ textAlign: 'center', color: '#86868b', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}>Need a specific feature without the monthly commitment? Purchase privileges securely via Razorpay.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>₹400</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Deadline Extension</div>
              <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Add extra time to your current project stage without accumulating day-by-day penalties.</p>
              <button disabled={loadingFeature} onClick={() => handlePayment(400, 'deadline_extension')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>Pay via UPI</button>
            </div>
            
            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>₹160</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Increased Capacity</div>
              <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Increase your monthly cap to 5 projects for the current billing cycle.</p>
              <button disabled={loadingFeature} onClick={() => handlePayment(160, 'capacity_increase')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>Pay via UPI</button>
            </div>

            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>₹80</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Project Withdrawal</div>
              <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Mandatory fee if you fail to complete or choose to withdraw from an accepted project.</p>
              <button disabled={loadingFeature} onClick={() => handlePayment(80, 'project_withdrawal')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: 13, borderColor: 'var(--warning)' }}>Pay penalty</button>
            </div>

            <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, borderBottomLeftRadius: 8 }}>POPULAR</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>₹800</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Main Artist Credit</div>
              <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Receive Main Artist placement on a single official release.</p>
              <button disabled={loadingFeature} onClick={() => handlePayment(800, 'main_artist_credit')} className="btn btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>Buy Credit</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
