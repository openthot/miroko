'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Onboarding() {
  const [formData, setFormData] = useState({
    legal_name: '',
    address: '',
    artist_name: '',
    spotify_link: '',
    specialization: 'Composer',
    terms_accepted: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.terms_accepted) {
      setError('You must accept the terms and conditions.')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        legal_name: formData.legal_name,
        address: formData.address,
        artist_name: formData.artist_name,
        spotify_link: formData.spotify_link,
        specializations: [formData.specialization],
        terms_accepted: true,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Failed to update profile. Please try again.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card" style={{ maxWidth: '600px', width: '100%', padding: '48px 32px' }}>
        <h1 className="auth-title">Complete Your Profile</h1>
        <p className="auth-subtitle">Please provide your details to access the platform.</p>

        {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="legal_name">Legal Full Name</label>
            <input
              id="legal_name"
              type="text"
              required
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="address">Residential Address</label>
            <input
              id="address"
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="artist_name">Artist Name</label>
            <input
              id="artist_name"
              type="text"
              required
              value={formData.artist_name}
              onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="spotify_link">Spotify Profile Link</label>
            <input
              id="spotify_link"
              type="url"
              required
              value={formData.spotify_link}
              onChange={(e) => setFormData({ ...formData, spotify_link: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="specialization">Primary Specialization</label>
            <select
              id="specialization"
              className="input-control"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              style={{ width: '100%', padding: '10px', background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="Composer">Composer</option>
              <option value="Sound Designer">Sound Designer</option>
              <option value="Arranger">Arranger</option>
              <option value="FX Mixer">FX & Effects Mixer</option>
              <option value="Mastering Engineer">Mixing & Mastering Engineer</option>
            </select>
          </div>

          <div style={{ margin: '20px 0', fontSize: '14px', lineHeight: '1.5' }}>
            <strong>Key Clause:</strong> All projects produced within the platform are released exclusively under <em>Soundwave Music Group / Universal Group</em>.
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="terms"
              required
              style={{ marginTop: '3px' }}
              checked={formData.terms_accepted}
              onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
            />
            <label htmlFor="terms" style={{ fontSize: '14px', margin: 0 }}>
              I agree to the legally binding Terms & Conditions and understand all works are released exclusively under Soundwave Music Group / Universal Group.
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Complete Onboarding'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '13px', color: '#86868b' }}>
          By continuing, you agree to the <strong style={{ color: 'var(--foreground)' }}>Soundwave Music Group</strong> platform policies.
        </div>
      </div>
    </div>
  )
}
