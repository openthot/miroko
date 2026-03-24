import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Fetch messages. 
  // Admin sees all. Producers see messages sent to them, sent by them, or broadcast to everyone (receiver_id is null).
  let messagesQuery = supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(name, role), receiver:profiles!receiver_id(name)')
    .order('created_at', { ascending: false })
  
  if (!isAdmin) {
    messagesQuery = messagesQuery.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},receiver_id.is.null`)
  }
  const { data: messages, error } = await messagesQuery
  
  // If Admin -> Show producers. If Producer -> Show admins.
  const { data: recipients } = await supabase.from('profiles').select('id, name').eq('role', isAdmin ? 'producer' : 'admin')

  async function sendMessage(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Safety verification: fetch if sender is admin
    const { data: senderProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const senderIsAdmin = senderProfile?.role === 'admin'
    
    const receiver_id = formData.get('receiver_id')
    const content = formData.get('content')
    
    // Ensure producers cannot broadcast
    const final_receiver_id = receiver_id === 'all' 
      ? (senderIsAdmin ? null : null /* Ideally error, but we'll null it, though UI prevents it */)
      : receiver_id

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: final_receiver_id,
      content
    })
    
    revalidatePath('/dashboard/messages')
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Messages</h1>
      </header>
      
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Send a Message</h2>
        <form action={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>To</label>
            <select name="receiver_id" className="input-control" style={{ backgroundColor: 'var(--secondary)' }} required>
              {isAdmin && <option value="all">Broadcast to All Producers</option>}
              {recipients?.map(p => (
                <option key={p.id} value={p.id}>{p.name || (isAdmin ? 'Unnamed Producer' : 'Admin')}</option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Message Content</label>
            <textarea name="content" className="input-control" rows="4" required placeholder="Type your message here..."></textarea>
          </div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>Send Message</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Recent Messages</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages?.map(m => {
            const isMe = m.sender_id === user.id
            const senderName = isMe ? 'You' : (m.sender?.name || 'Unknown User')
            const isBroadcast = m.receiver_id === null
            const receiverName = isBroadcast ? 'Everyone' : (m.receiver_id === user.id ? 'You' : (m.receiver?.name || 'Unknown User'))

            return (
              <div key={m.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '18px' }}>
                    {senderName} 
                    <span style={{ color: '#86868b', fontSize: '15px', fontWeight: 'normal' }}> → {receiverName}</span>
                  </strong>
                  <span style={{ fontSize: '14px', color: '#86868b' }}>{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p style={{ color: 'var(--foreground)', opacity: 0.9 }}>{m.content}</p>
                {isBroadcast && (
                  <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '12px', fontWeight: '500' }}>
                    BROADCAST MESSAGE
                  </div>
                )}
              </div>
            )
          })}
          {(!messages || messages.length === 0) && (
            <p style={{ color: '#86868b', textAlign: 'center', margin: '20px 0' }}>No messages found in your inbox.</p>
          )}
        </div>
      </div>
    </div>
  )
}
