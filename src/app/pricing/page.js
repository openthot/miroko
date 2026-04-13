'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Script from 'next/script'
import Link from 'next/link'
import StandardPlanCard from '@/components/pricing/StandardPlanCard'
import PremiumPlanCard from '@/components/pricing/PremiumPlanCard'
import ALaCarteSection from '@/components/pricing/ALaCarteSection'
import { usePayment } from '@/hooks/usePayment'

export default function PricingPage() {
  const [profile, setProfile] = useState(null)
  const { loadingFeature, message, error, handlePayment } = usePayment(profile, setProfile)
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
  }, [supabase])

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', paddingBottom: 100 }}>
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Navigation */}
      <nav style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/" style={{ fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>M</div>
          Miroko
        </Link>
        <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}>Back to Dashboard</Link>
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
          <StandardPlanCard profile={profile} />

          {/* Premium Plan */}
          <PremiumPlanCard
            profile={profile}
            loadingFeature={loadingFeature}
            handlePayment={handlePayment}
          />
        </div>

        {/* A La Carte Features */}
        <ALaCarteSection
          loadingFeature={loadingFeature}
          handlePayment={handlePayment}
        />
      </section>
    </div>
  )
}
