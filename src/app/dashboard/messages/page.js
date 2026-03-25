import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function MessagesPage({ searchParams }) {
  const { recipient, search } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Fetch recipients list
  let recipientsQuery = supabase.from('profiles').select('id, name').neq('id', user.id)
  if (isAdmin) {
    recipientsQuery = recipientsQuery.eq('role', 'producer')
    if (search) {
      recipientsQuery = recipientsQuery.ilike('name', `%${search}%`)
    }
  } else {
    recipientsQuery = recipientsQuery.eq('role', 'admin')
  }
  const { data: recipients } = await recipientsQuery

  // Fetch current recipient info
  let activeRecipient = null
  if (recipient === 'all') {
    activeRecipient = { id: 'all', name: 'Broadcast Channel' }
  } else if (recipient) {
    const { data: p } = await supabase.from('profiles').select('id, name').eq('id', recipient).single()
    activeRecipient = p
  }

  // Fetch messages for the active conversation
  let messages = []
  if (activeRecipient) {
    let query = supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(name, role)')
      .order('created_at', { ascending: true })

    if (activeRecipient.id === 'all') {
      query = query.is('receiver_id', null)
    } else {
      query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeRecipient.id}),and(sender_id.eq.${activeRecipient.id},receiver_id.eq.${user.id})`)
    }
    const { data } = await query
    messages = data || []
  }

  async function sendMessage(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    const recId = formData.get('receiver_id')
    const content = formData.get('content')
    
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: recId === 'all' ? null : recId,
      content
    })
    
    revalidatePath('/dashboard/messages')
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '2rem' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Conversations</h2>
          {isAdmin && (
            <form action="" method="get">
              <input 
                name="search" 
                className="input-control" 
                placeholder="Search producers..." 
                defaultValue={search || ''}
                style={{ fontSize: '14px', padding: '10px' }}
              />
            </form>
          )}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <Link 
            href="/dashboard/messages?recipient=all"
            style={{ 
              display: 'block', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '8px',
              background: recipient === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: recipient === 'all' ? '#fff' : 'inherit'
            }}
          >
            📢 Broadcast Channel
          </Link>
          
          <div style={{ color: '#86868b', fontSize: '12px', textTransform: 'uppercase', padding: '10px 12px', fontWeight: '600' }}>
            {isAdmin ? 'Producers' : 'Admins'}
          </div>
          
          {recipients?.map(r => (
            <Link 
              key={r.id}
              href={`/dashboard/messages?recipient=${r.id}`}
              style={{ 
                display: 'block', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '4px',
                background: recipient === r.id ? 'var(--primary)' : 'transparent',
                color: recipient === r.id ? '#fff' : 'inherit',
                transition: 'all 0.2s'
              }}
            >
              {r.name || 'Unnamed'}
            </Link>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeRecipient ? (
          <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem' }}>{activeRecipient.name}</h2>
              {activeRecipient.id === 'all' && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>BROADCAST CHANNEL</span>}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map(m => {
                const isMe = m.sender_id === user.id
                return (
                  <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'var(--primary)' : 'var(--secondary)',
                      color: isMe ? '#fff' : 'inherit',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                      <p style={{ fontSize: '15px', lineHeight: '1.4' }}>{m.content}</p>
                    </div>
                    <div style={{ fontSize: '10px', color: '#86868b', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                      {!isMe && <span style={{ fontWeight: '600', marginRight: '4px' }}>{m.sender?.name}</span>}
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#86868b', marginTop: '20%' }}>No messages yet. Say hello!</div>
              )}
            </div>

            {(activeRecipient.id !== 'all' || isAdmin) && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                <form action={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                  <input type="hidden" name="receiver_id" value={activeRecipient.id} />
                  <input 
                    name="content" 
                    className="input-control" 
                    placeholder="Type a message..." 
                    required 
                    autoComplete="off"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" type="submit">Send</button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b', flexDirection: 'column', gap: '1rem' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}

