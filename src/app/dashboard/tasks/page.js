import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import TaskAssignmentForm from './TaskAssignmentForm'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: tasks } = await supabase.from('tasks').select('*, profiles!producer_id(name)').order('created_at', { ascending: false })
  const { data: producers } = await supabase.from('profiles').select('id, name').eq('role', 'producer')

  async function createTask(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('tasks').insert({
      admin_id: user.id,
      producer_id: formData.get('producer_id'),
      title: formData.get('title'),
      description: formData.get('description'),
      admin_file_url: formData.get('file_url'),
    })
    revalidatePath('/dashboard/tasks')
  }

  async function completeTask(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const task_id = formData.get('task_id')
    const producer_file_url = formData.get('producer_file_url')
    
    await supabase.from('tasks').update({
      status: 'completed',
      producer_file_url
    }).eq('id', task_id).eq('producer_id', user.id)
    
    revalidatePath('/dashboard/tasks')
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Tasks</h1>
      </header>
      
      {isAdmin && (
        <TaskAssignmentForm producers={producers || []} createTask={createTask} />
      )}

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>{isAdmin ? 'All Assigned Tasks' : 'Your Daily Tasks'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tasks?.filter(t => isAdmin || t.producer_id === user.id).map(t => (
            <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{t.title}</strong>
                <span style={{ fontSize: '14px', color: '#86868b' }}>{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ color: 'var(--foreground)', opacity: 0.9, marginBottom: '16px' }}>{t.description}</p>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: t.status === 'completed' ? 'var(--success)' : 'var(--warning)', 
                  color: '#fff', 
                  padding: '4px 10px', 
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {t.status.toUpperCase()}
                </span>
                
                {t.admin_file_url && (
                  <a href={t.admin_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>Download File</a>
                )}
                
                {isAdmin ? (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {t.status === 'completed' && t.producer_file_url && (
                      <a href={t.producer_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px', borderColor: 'var(--success)' }}>📥 View Producer Work</a>
                    )}
                    <span style={{ fontSize: '13px', color: '#86868b' }}>Assigned to: {t.profiles?.name || 'Unknown'}</span>
                  </div>
                ) : (
                  t.status !== 'completed' ? (
                    <form action={completeTask} style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <input type="hidden" name="task_id" value={t.id} />
                      <input name="producer_file_url" type="url" className="input-control" placeholder="Paste file link (Drive, Dropbox URL)" required style={{ padding: '6px 12px', fontSize: '13px', minWidth: '220px' }} />
                      <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Mark Completed</button>
                    </form>
                  ) : (
                     t.producer_file_url ? (
                      <span style={{ fontSize: '13px', color: '#86868b', marginLeft: 'auto' }}>
                        Submitted: <a href={t.producer_file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Link</a>
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#86868b', marginLeft: 'auto' }}>Completed</span>
                    )
                  )
                )}
              </div>
            </div>
          ))}
          {(!tasks || tasks.length === 0) && (
            <p style={{ color: '#86868b', textAlign: 'center', margin: '20px 0' }}>No tasks found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
