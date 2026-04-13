import { createClient, getUserAndProfile } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { user, profile } = await getUserAndProfile()
  const isAdmin = profile?.role === 'admin'

  // Fetch notifications for the user
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order('created_at', { ascending: false })

  async function markAsRead(formData) {
    'use server'
    const supabase = await createClient()
    const notification_id = formData.get('notification_id')
    await supabase.from('notifications').update({ is_read: true }).eq('id', notification_id)
    revalidatePath('/dashboard/notifications')
  }

  async function sendNotification(formData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('notifications').insert({
      title: formData.get('title'),
      message: formData.get('message'),
      user_id: formData.get('user_id') || null // empty string from select becomes null for broadcast
    })
    revalidatePath('/dashboard/notifications')
  }

  // Admin users dropdown
  const { data: users } = await supabase.from('profiles').select('id, name').order('name')

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Notification Center</h1>
      </header>

      {isAdmin && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Send System Update</h2>
          <form action={sendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Recipient</label>
              <select name="user_id" className="input-control" style={{ width: '100%', padding: '10px', background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)' }}>
                <option value="">All Users (Broadcast)</option>
                {users?.map(u => (
                  <option key={u.id} value={u.id}>{u.name || 'Unnamed'}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Title</label>
              <input name="title" className="input-control" required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Message</label>
              <textarea name="message" className="input-control" required rows="3"></textarea>
            </div>
            <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Send Notification</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Recent Notifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications?.length > 0 ? notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '24px', 
              background: n.is_read ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 'var(--radius-md)', 
              border: `1px solid ${n.is_read ? 'var(--surface-border)' : 'var(--primary)'}` 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{n.title} {!n.user_id && <span style={{ color: 'var(--primary)', fontSize: '12px', marginLeft: '8px' }}>(Broadcast)</span>}</strong>
                <span style={{ fontSize: '14px', color: '#86868b' }}>{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ color: 'var(--foreground)', opacity: 0.9, marginBottom: '16px' }}>{n.message}</p>
              
              {!n.is_read && (
                <form action={markAsRead} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <input type="hidden" name="notification_id" value={n.id} />
                  <button className="btn btn-secondary" type="submit" style={{ padding: '4px 12px', fontSize: '12px' }}>Mark as Read</button>
                </form>
              )}
            </div>
          )) : (
            <p style={{ color: '#86868b' }}>You have no notifications.</p>
          )}
        </div>
      </div>
    </div>
  )
}
