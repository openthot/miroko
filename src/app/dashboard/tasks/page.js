import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Note: Ensure your Supabase includes the new "projects" table and updated "tasks" schema!
export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role, specializations, tier').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const userSpecialization = profile?.specializations?.[0]

  // For Admins: Fetch Projects and their associated Tasks
  const { data: projects } = await supabase
    .from('projects')
    .select('*, tasks(*, profiles!producer_id(name))')
    .order('created_at', { ascending: false })

  // Pre-sort project tasks to avoid sorting inside render loop and string comparison avoids new Date allocations
  if (projects) {
    projects.forEach(p => {
      if (p.tasks) {
        p.tasks.sort((a, b) => (a.created_at < b.created_at ? -1 : (a.created_at > b.created_at ? 1 : 0)))
      }
    })
  }

  // For Producers: Fetch all tasks (available + assigned)
  // To handle legacy tasks without projects, we use an outer join if needed, but since we are fetching from tasks directly it's fine.
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*, projects(*), profiles!producer_id(name)')
    .order('created_at', { ascending: false })

  // Admin: Create a new Project (opens Composer stage)
  async function createProject(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')
    
    const stage_deadlines = {
      'Composer': parseInt(formData.get('deadline_Composer')) || 3,
      'Sound Designer': parseInt(formData.get('deadline_Sound Designer')) || 3,
      'Arranger': parseInt(formData.get('deadline_Arranger')) || 3,
      'FX Mixer': parseInt(formData.get('deadline_FX Mixer')) || 3,
      'Mastering Engineer': parseInt(formData.get('deadline_Mastering Engineer')) || 3,
    }

    // 1. Create Project
    const { data: project } = await supabase.from('projects').insert({
      admin_id: user.id,
      title: formData.get('title'),
      current_stage: 'Composer',
      status: 'active',
      stage_deadlines: stage_deadlines
    }).select().single()

    if (project) {
      // 2. Create initial Composer Task
      // Deadline will be calculated when the task is accepted.
      await supabase.from('tasks').insert({
        project_id: project.id,
        admin_id: user.id,
        stage: 'Composer',
        title: `Composer Stage: ${formData.get('title')}`,
        description: formData.get('description'),
        admin_file_url: formData.get('file_url'),
        deadline_days: stage_deadlines['Composer'],
        deadline: null, // Set upon acceptance
        producer_id: null // Unassigned
      })
    }
    
    revalidatePath('/dashboard/tasks')
  }

  // Admin: Create Standalone Custom Task
  async function createCustomTask(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')
    
    const stages = formData.getAll('specializations').join(', ')
    const deadlineDays = parseInt(formData.get('deadline_days')) || 3

    await supabase.from('tasks').insert({
      admin_id: user.id,
      stage: stages,
      title: formData.get('title'),
      description: formData.get('description'),
      admin_file_url: formData.get('file_url'),
      deadline_days: deadlineDays,
      deadline: null, // Set upon acceptance
      producer_id: null
    })
    
    revalidatePath('/dashboard/tasks')
  }

  // Admin: Approve & Advance Stage
  async function advanceStage(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const project_id = formData.get('project_id')
    const current_stage = formData.get('current_stage')
    const next_stage = formData.get('next_stage')
    const file_url = formData.get('file_url') // the returned file from the previous stage
    
    // Get the project's stage_deadlines
    const { data: project } = await supabase.from('projects').select('stage_deadlines').eq('id', project_id).single()
    const deadlineDays = project?.stage_deadlines?.[next_stage] || 3

    // Update project stage
    await supabase.from('projects').update({ current_stage: next_stage === 'Completed' ? 'Completed' : next_stage, status: next_stage === 'Completed' ? 'completed' : 'active' }).eq('id', project_id)

    if (next_stage !== 'Completed') {
      // Create next stage task
      await supabase.from('tasks').insert({
        project_id,
        admin_id: user.id,
        stage: next_stage,
        title: `${next_stage} Stage`,
        description: `Continue production for stage: ${next_stage}`,
        admin_file_url: file_url,
        deadline_days: deadlineDays,
        deadline: null, // Set upon acceptance
        producer_id: null
      })
    }
    revalidatePath('/dashboard/tasks')
  }

  // Admin: Delete Project
  async function deleteProject(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const project_id = formData.get('project_id')
    await supabase.from('projects').delete().eq('id', project_id)
    revalidatePath('/dashboard/tasks')
  }

  // Admin: Mark Project as Completed manually
  async function markProjectCompleted(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const project_id = formData.get('project_id')
    await supabase.from('projects').update({ status: 'completed', current_stage: 'Completed' }).eq('id', project_id)
    
    // Also mark active tasks as completed to clean up the queue
    await supabase.from('tasks').update({ status: 'completed' }).eq('project_id', project_id).neq('status', 'completed')
    
    revalidatePath('/dashboard/tasks')
  }

  // Admin: Revert Task for Edit
  async function revertTask(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const task_id = formData.get('task_id')
    const edit_reason = formData.get('edit_reason')
    const new_deadline_days = parseInt(formData.get('new_deadline_days')) || 3

    const { data: task } = await supabase.from('tasks').select('description').eq('id', task_id).single()
    const newDescription = `${task?.description || ''}\n\n[ADMIN EDIT REQUEST]: ${edit_reason}`

    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + new_deadline_days)

    await supabase.from('tasks').update({
      status: 'in_progress',
      description: newDescription,
      deadline_days: new_deadline_days,
      deadline: newDeadline.toISOString(),
      producer_file_url: null, // Clear the previous submission
      delay_penalty: 0,
      deadline_waived: false
    }).eq('id', task_id)

    revalidatePath('/dashboard/tasks')
  }

  // Producer: Accept an Available Task
  async function acceptTask(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const task_id = formData.get('task_id')

    // Enforce limits
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
    const isPremium = profile?.tier === 'premium'
    const maxProjects = isPremium ? 5 : 2

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)
    
    const { count } = await supabase.from('tasks')
      .select('id', { count: 'exact' })
      .eq('producer_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if (count >= maxProjects) {
      console.error(`Monthly limit reached (${maxProjects})`)
      // Normally we'd throw or indicate error to the UI
      return
    }

    // Get the task's deadline_days
    const { data: taskData } = await supabase.from('tasks').select('deadline_days').eq('id', task_id).single()
    const days = taskData?.deadline_days || 3

    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + Number(days))

    // Lock the task to this user and set deadline
    await supabase.from('tasks').update({
      producer_id: user.id,
      status: 'in_progress',
      deadline: newDeadline.toISOString()
    }).eq('id', task_id).is('producer_id', null)

    revalidatePath('/dashboard/tasks')
  }

    // Producer: Complete Task
  async function completeTask(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const task_id = formData.get('task_id')
    const producer_file_url = formData.get('producer_file_url')
    
    // Calculate delay penalty ($1/day)
    const { data: task } = await supabase.from('tasks').select('deadline, deadline_waived').eq('id', task_id).single()
    let penalty = 0
    if (task?.deadline && !task.deadline_waived) {
      const diffTime = Math.max(0, new Date() - new Date(task.deadline))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) penalty = diffDays
    }

    // Premium tier is exempt from delay penalties
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
    if (profile?.tier === 'premium') {
      penalty = 0
    }

    await supabase.from('tasks').update({
      status: 'completed',
      producer_file_url,
      delay_penalty: penalty
    }).eq('id', task_id).eq('producer_id', user.id)
    
    revalidatePath('/dashboard/tasks')
  }

  // Producer: Waive Deadline ($5)
  async function waiveDeadline(formData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const task_id = formData.get('task_id')

    // In a real app, this would integrate with Razorpay/Stripe here.
    // We assume the payment is successful and update the task.
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: 5,
      currency: 'USD',
      feature_purchased: 'deadline_waiver',
      status: 'completed'
    })

    await supabase.from('tasks').update({ deadline_waived: true }).eq('id', task_id).eq('producer_id', user.id)
    revalidatePath('/dashboard/tasks')
  }

  // Helper arrays for stage progression
  const STAGES = ['Composer', 'Sound Designer', 'Arranger', 'FX Mixer', 'Mastering Engineer', 'Completed']
  const getNextStage = (current) => STAGES[STAGES.indexOf(current) + 1]

  const myTasks = allTasks?.filter(t => t.producer_id === user.id) || []
  const availableTasks = allTasks?.filter(t => !t.producer_id && t.stage?.includes(userSpecialization) && t.status !== 'completed') || []
  const allOtherTasks = allTasks?.filter(t => !t.producer_id && !t.stage?.includes(userSpecialization) && t.status !== 'completed') || []

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">{isAdmin ? 'Project Pipeline' : 'My Production Pipeline'}</h1>
      </header>
      
      {isAdmin && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Create New Project</h2>
          <form action={createProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Project Title</label>
              <input name="title" className="input-control" required placeholder="E.g., Summer Anthem 2026" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Instructions & Specs</label>
              <textarea name="description" className="input-control" rows="3"></textarea>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Initial Stem/Resource Link (URL)</label>
              <input name="file_url" className="input-control" placeholder="https://..." />
            </div>

            <div className="input-group" style={{ marginBottom: '8px' }}>
              <label style={{ marginBottom: '12px', display: 'block' }}>Stage Deadlines (Days)</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {STAGES.filter(s => s !== 'Completed').map(st => (
                  <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '14px', width: '120px' }}>{st}</label>
                    <input type="number" name={`deadline_${st}`} className="input-control" defaultValue={3} min={1} style={{ width: '80px', padding: '4px' }} />
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Initiate Project Pipeline</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '8px' }}>Create Custom Standalone Task</h2>
          <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>Bypass the pipeline and dispatch an independent task directly to specific specializations.</p>
          <form action={createCustomTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Task Title</label>
              <input name="title" className="input-control" required placeholder="E.g., Emergency Vocal Edit" />
            </div>
            
            <div className="input-group" style={{ marginBottom: '8px' }}>
              <label style={{ marginBottom: '12px', display: 'block' }}>Target Specializations</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {STAGES.filter(s => s !== 'Completed').map(st => (
                  <label key={st} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="specializations" value={st} />
                    <span style={{ fontSize: '14px' }}>{st}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Instructions & Specs</label>
              <textarea name="description" className="input-control" rows="3" required></textarea>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Asset Link (URL)</label>
              <input name="file_url" className="input-control" placeholder="https://..." />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Deadline (Days)</label>
              <input type="number" name="deadline_days" className="input-control" defaultValue={3} min={1} style={{ width: '100px' }} />
            </div>
            <button className="btn btn-secondary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Dispatch Custom Task</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Active Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {projects?.map(p => (
              <div key={p.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <strong style={{ fontSize: '20px' }}>{p.title}</strong>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ 
                      background: p.status === 'completed' ? 'var(--success)' : 'var(--primary)', 
                      color: p.status === 'completed' ? '#fff' : '#000', 
                      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' 
                    }}>
                      {p.current_stage.toUpperCase()}
                    </span>
                    
                    <form action={markProjectCompleted} style={{ display: 'inline' }}>
                      <input type="hidden" name="project_id" value={p.id} />
                      <button type="submit" disabled={p.status === 'completed'} className="btn" style={{ padding: '4px 10px', fontSize: '11px', background: p.status === 'completed' ? 'rgba(255,255,255,0.1)' : 'rgba(52, 199, 89, 0.1)', color: p.status === 'completed' ? '#86868b' : '#34c759' }}>
                        {p.status === 'completed' ? 'Finished' : 'Mark Done'}
                      </button>
                    </form>

                    <form action={deleteProject} style={{ display: 'inline' }, { marginLeft: '4px' }}>
                      <input type="hidden" name="project_id" value={p.id} />
                      <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a' }}>
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
                
                <h4 style={{ marginBottom: '12px', color: '#86868b' }}>Project Stages:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {p.tasks?.map(t => (
                    <div key={t.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${t.status === 'completed' ? 'var(--success)' : 'var(--warning)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '15px' }}>{t.stage}</strong>
                          <span style={{ fontSize: '13px', color: '#86868b' }}>
                            {t.producer_id ? `Assigned to: ${t.profiles?.name || 'Unknown'}` : 'Unassigned'} | 
                            Status: {t.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {t.producer_file_url && (
                             <a href={t.producer_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--success)' }}>📥 View Work</a>
                          )}
                          {t.status === 'completed' && t.stage === p.current_stage && t.stage !== 'Completed' && p.status !== 'completed' && (
                             <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                               <form action={advanceStage}>
                                 <input type="hidden" name="project_id" value={p.id} />
                                 <input type="hidden" name="current_stage" value={t.stage} />
                                 <input type="hidden" name="next_stage" value={getNextStage(t.stage)} />
                                 <input type="hidden" name="file_url" value={t.producer_file_url} />
                                 <button className="btn btn-primary" type="submit" style={{ padding: '6px 12px', fontSize: '12px' }}>Advance to {getNextStage(t.stage)}</button>
                               </form>

                               <form action={revertTask} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                 <input type="hidden" name="task_id" value={t.id} />
                                 <input type="text" name="edit_reason" placeholder="Reason for edit..." required className="input-control" style={{ padding: '4px 8px', fontSize: '11px', width: '150px' }} />
                                 <input type="number" name="new_deadline_days" placeholder="Days" required min="1" className="input-control" style={{ padding: '4px 8px', fontSize: '11px', width: '60px' }} />
                                 <button className="btn btn-secondary" type="submit" style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'var(--warning)', color: 'var(--warning)' }}>Revert</button>
                               </form>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(!projects || projects.length === 0) && (
              <p style={{ color: '#86868b', textAlign: 'center' }}>No active projects.</p>
            )}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div className="glass-panel" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: '24px' }}>My Assigned Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myTasks.length > 0 ? myTasks.map(t => (
                <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '18px' }}>{t.projects?.title || t.title} <span style={{ color: '#86868b', fontSize: '14px', marginLeft: '8px' }}>({t.stage || 'Legacy Task'})</span></strong>
                    <span style={{ fontSize: '14px', color: '#86868b' }}>Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <p style={{ color: 'var(--foreground)', opacity: 0.9, marginBottom: '16px' }}>{t.description}</p>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {t.admin_file_url && (
                      <a href={t.admin_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>Download Resources</a>
                    )}
                    
                    {t.status !== 'completed' && !t.deadline_waived && (
                      <form action={waiveDeadline}>
                        <input type="hidden" name="task_id" value={t.id} />
                        <button className="btn btn-secondary" type="submit" style={{ padding: '6px 14px', fontSize: '13px', borderColor: 'var(--warning)', color: 'var(--warning)' }}>Waive Deadline ($5)</button>
                      </form>
                    )}

                    {t.status !== 'completed' && t.deadline_waived && (
                      <span style={{ fontSize: '13px', color: 'var(--warning)', padding: '6px 14px', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)' }}>Deadline Waived</span>
                    )}

                    {t.status !== 'completed' ? (
                      <form action={completeTask} style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <input type="hidden" name="task_id" value={t.id} />
                        <input name="producer_file_url" type="url" className="input-control" placeholder="Paste file link (Drive, Dropbox URL)" required style={{ padding: '6px 12px', fontSize: '13px', minWidth: '220px' }} />
                        <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Submit Work</button>
                      </form>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#86868b', marginLeft: 'auto' }}>
                        Submitted: <a href={t.producer_file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Link</a>
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <p style={{ color: '#86868b' }}>You have no assigned tasks.</p>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: '8px' }}>Available Projects ({userSpecialization})</h2>
            <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>First to accept is locked to the project.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {availableTasks.length > 0 ? availableTasks.map(t => (
                <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '18px' }}>{t.projects?.title || t.title}</strong>
                    <form action={acceptTask}>
                      <input type="hidden" name="task_id" value={t.id} />
                      <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Accept & Lock</button>
                    </form>
                  </div>
                  <p style={{ color: 'var(--foreground)', opacity: 0.9, fontSize: '14px' }}>{t.description}</p>
                </div>
              )) : (
                <p style={{ color: '#86868b' }}>No projects available for your specialization at the moment.</p>
              )}
            </div>
          </div>

          {profile?.tier === 'premium' && (
            <div className="glass-panel" style={{ padding: '40px', borderColor: 'var(--primary)' }}>
              <h2 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Premium: Complete Catalogue</h2>
              <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>As a Premium Artist, you see all available projects globally.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {allOtherTasks.length > 0 ? allOtherTasks.map(t => (
                <div key={t.id} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '18px' }}>{t.projects?.title || t.title} <span style={{ color: 'var(--primary)', fontSize: '12px' }}>({t.stage})</span></strong>
                    <form action={acceptTask}>
                      <input type="hidden" name="task_id" value={t.id} />
                      <button className="btn btn-primary" type="submit" style={{ padding: '6px 14px', fontSize: '13px' }}>Accept & Lock</button>
                    </form>
                  </div>
                </div>
              )) : (
                <p style={{ color: '#86868b' }}>No other projects available.</p>
              )}
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
