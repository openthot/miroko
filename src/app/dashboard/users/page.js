import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase.from('profiles').select('*')

  async function createProducer(formData) {
    'use server'
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('name')
    
    // We import the base client for admin actions
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    
    // We need SUPABASE_SERVICE_ROLE_KEY in .env.local for this to work behind the scenes
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Cannot create user administratively.")
      return
    }

    const adminAuthClient = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await adminAuthClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name }
    })

    if (error) {
      console.error("Error creating user:", error)
    }
    
    revalidatePath('/dashboard/users')
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">User Management</h1>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2>Create New Producer</h2>
        <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '16px' }}>
          This requires you to add your <code style={{color: 'var(--primary)'}}>SUPABASE_SERVICE_ROLE_KEY</code> to `.env.local`.
        </p>
        <form action={createProducer} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
          <button className="btn btn-primary" type="submit" style={{ height: '42px', flex: '1 1 150px' }}>Create Account</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2>All Producers</h2>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Role</th>
              <th style={{ padding: '0.75rem' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem' }}>{u.name || 'Unnamed'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ 
                    background: u.role === 'admin' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.1)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#a1a1aa' }}>No users found. Note: You must run the schema.sql in Supabase first.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
