import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function StatisticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: stats } = await supabase.from('statistics').select('*').order('created_at', { ascending: false })

  async function uploadStats(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    await supabase.from('statistics').insert({
      admin_id: user.id,
      title: formData.get('title'),
      file_url: formData.get('file_url'),
    })
    revalidatePath('/dashboard/statistics')
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Statistics</h1>
      </header>
      
      {isAdmin && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Upload Monthly Statistics</h2>
          <form action={uploadStats} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Title (e.g., March 2026 Report)</label>
              <input name="title" className="input-control" required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Document Link (PDF or Image URL)</label>
              <input name="file_url" type="url" className="input-control" placeholder="https://..." required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Upload Report</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Available Reports</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats?.map(s => (
            <div key={s.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{s.title}</strong>
                <span style={{ fontSize: '14px', color: '#86868b' }}>Uploaded on {new Date(s.created_at).toLocaleDateString()}</span>
              </div>
              <a href={s.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary">Download PDF</a>
            </div>
          ))}
          {(!stats || stats.length === 0) && (
            <p style={{ color: '#86868b', textAlign: 'center', margin: '20px 0' }}>No statistics uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
