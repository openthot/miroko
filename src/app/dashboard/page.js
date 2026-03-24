import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="btn btn-secondary" type="submit">Sign Out</button>
        </form>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2>Welcome back, {user?.email}</h2>
        <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>
          This is your Miroko producer management portal. Here you can track tasks, send messages, and manage payments.
        </p>
      </div>
    </div>
  )
}
