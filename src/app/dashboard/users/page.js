import { createClient } from '@/utils/supabase/server'
import { createProducerAction, deleteUserAction } from './actions'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: users } = await supabase.from('profiles').select('*')

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">User Management</h1>
      </header>
      
      {isAdmin && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2>Create New Producer</h2>
          <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '16px' }}>
            Enter details to create a new producer account.
          </p>
          <form action={createProducerAction} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
              <label>Name</label>
              <input name="name" className="input-control" required />
            </div>
            <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
              <label>Email</label>
              <input name="email" type="email" className="input-control" required />
            </div>
            <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
              <label>Temporary Password</label>
              <input name="password" type="password" className="input-control" required />
            </div>
            <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
              <label>Assign Specialization</label>
              <select name="specialization" className="input-control" required style={{ width: '100%', padding: '10px', background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)' }}>
                <option value="Composer">Composer</option>
                <option value="Sound Designer">Sound Designer</option>
                <option value="Arranger">Arranger</option>
                <option value="FX Mixer">FX Mixer</option>
                <option value="Mastering Engineer">Mastering</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ height: '42px', flex: '1 1 150px' }}>Provision Account</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2>All Profiles</h2>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Role</th>
              <th style={{ padding: '0.75rem' }}>Joined</th>
              {isAdmin && <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem' }}>{u.name || 'Unnamed'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ 
                    background: u.role === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                    color: u.role === 'admin' ? '#fff' : 'inherit',
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                {isAdmin && (
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {u.id !== currentUser.id && (
                      <form action={deleteUserAction.bind(null, u.id)}>
                        <button className="btn" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a' }} type="submit">
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

