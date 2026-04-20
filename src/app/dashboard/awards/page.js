import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function AwardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: awards } = await supabase.from('awards').select('*, profiles!producer_id(name)').order('date', { ascending: false })
  const { data: producers } = await supabase.from('profiles').select('id, name').eq('role', 'producer')

  async function grantAward(formData) {
    'use server'
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can grant awards')
    }

    await supabase.from('awards').insert({
      producer_id: formData.get('producer_id'),
      type: formData.get('type'),
      date: formData.get('date'),
      notes: formData.get('notes'),
    })
    revalidatePath('/dashboard/awards')
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Awards</h1>
      </header>
      
      {isAdmin && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Grant New Award</h2>
          <form action={grantAward} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Select Producer</label>
              <select name="producer_id" className="input-control" required>
                {producers?.map(p => (
                  <option key={p.id} value={p.id}>{p.name || 'Unnamed'}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                <label>Award Type</label>
                <select name="type" className="input-control" required>
                  <option value="daily">Daily Winner</option>
                  <option value="monthly">Monthly Winner</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                <label>Date</label>
                <input name="date" type="date" className="input-control" required />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Notes / Reason</label>
              <textarea name="notes" className="input-control" rows="2" placeholder="e.g., Outstanding output and fast delivery..."></textarea>
            </div>
            <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Grant Award</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Leaderboard & Winners</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {awards?.map(a => (
            <div key={a.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '40px' }}>
                {a.type === 'monthly' ? '🏆' : '🏅'}
              </div>
              <div>
                <strong style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>{a.profiles?.name || 'Unknown'}</strong>
                <span style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '500' }}>
                  {a.type === 'monthly' ? 'Monthly Winner' : 'Daily Winner'}
                </span>
                <span style={{ fontSize: '14px', color: '#86868b', marginLeft: '12px' }}>{new Date(a.date).toLocaleDateString()}</span>
                {a.notes && <p style={{ marginTop: '8px', color: 'var(--foreground)', opacity: 0.8 }}>"{a.notes}"</p>}
              </div>
            </div>
          ))}
          {(!awards || awards.length === 0) && (
            <p style={{ color: '#86868b', textAlign: 'center', margin: '20px 0' }}>No awards granted yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
