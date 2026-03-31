'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    artist_name: '',
    avatar_url: '',
    specialization: ''
  })
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
          setFormData({
            name: data.name || '',
            artist_name: data.artist_name || '',
            avatar_url: data.avatar_url || '',
            specialization: data.specializations?.[0] || 'Composer'
          })
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error: updateError } = await supabase.from('profiles').update({
      name: formData.name,
      artist_name: formData.artist_name,
      avatar_url: formData.avatar_url,
      specializations: [formData.specialization]
    }).eq('id', user.id)

    if (updateError) setError(updateError.message)
    else {
      setMessage('Profile updated successfully.')
      setProfile({ ...profile, ...formData, specializations: [formData.specialization] })
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (passwords.new_password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const { error: pwdError } = await supabase.auth.updateUser({
      password: passwords.new_password
    })

    if (pwdError) setError(pwdError.message)
    else {
      setMessage('Password updated successfully.')
      setPasswords({ new_password: '', confirm_password: '' })
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading profile...</div>

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Profile Settings</h1>
      </header>

      {message && <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>{message}</div>}
      {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Profile Card & Avatar */}
        <div className="glass-panel" style={{ padding: '40px', flex: '1 1 300px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ 
              width: 120, height: 120, borderRadius: '50%', background: 'var(--secondary)', border: '2px solid var(--primary)', 
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--primary)' }}>{formData.name?.charAt(0) || 'M'}</span>
              )}
            </div>
            <h2 style={{ fontSize: 24, marginBottom: 4 }}>{profile?.artist_name || profile?.name}</h2>
            <div style={{ color: 'var(--primary)', fontWeight: 500, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>{profile?.tier || 'Standard'} Tier</div>
          </div>

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Avatar Source URL</label>
              <input className="input-control" type="url" placeholder="https://..." value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <input className="input-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Artist Name</label>
              <input className="input-control" required value={formData.artist_name} onChange={e => setFormData({...formData, artist_name: e.target.value})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Primary Specialization</label>
              <select className="input-control" required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)' }}>
                <option value="Composer">Composer</option>
                <option value="Sound Designer">Sound Designer</option>
                <option value="Arranger">Arranger</option>
                <option value="FX Mixer">FX & Effects Mixer</option>
                <option value="Mastering Engineer">Mixing & Mastering Engineer</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }}>Update Profile Details</button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="glass-panel" style={{ padding: '40px', flex: '1 1 300px' }}>
          <h2 style={{ marginBottom: '24px' }}>Security & Login</h2>
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>New Password</label>
              <input className="input-control" type="password" required value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Confirm New Password</label>
              <input className="input-control" type="password" required value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} />
            </div>
            <button className="btn btn-secondary" type="submit" style={{ marginTop: 10 }}>Update Password</button>
          </form>
        </div>
      </div>
    </div>
  )
}
