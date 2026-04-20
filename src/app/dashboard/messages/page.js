import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Sidebar from './components/Sidebar'
import MainView from './components/MainView'

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
    
    const finalReceiverId = recId === 'all' ? null : (recId || null);

    if (!finalReceiverId && profile?.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can broadcast messages')
    }

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: finalReceiverId,
      content
    })
    
    revalidatePath('/dashboard/messages')
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '2rem' }}>
      <Sidebar
        isAdmin={isAdmin}
        search={search}
        recipient={recipient}
        recipients={recipients}
      />

      <MainView
        activeRecipient={activeRecipient}
        messages={messages}
        user={user}
        isAdmin={isAdmin}
        sendMessage={sendMessage}
      />
    </div>
  )
}
