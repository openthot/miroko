'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper arrays for stage progression
const STAGES = ['Composer', 'Sound Designer', 'Arranger', 'FX Mixer', 'Mastering Engineer', 'Completed']
const getNextStage = (current) => STAGES[STAGES.indexOf(current) + 1]

// Admin: Create a new Project (opens Composer stage)
export async function createProject(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Create Project
  const { data: project } = await supabase.from('projects').insert({
    admin_id: user.id,
    title: formData.get('title'),
    current_stage: 'Composer',
    status: 'active'
  }).select().single()

  if (project) {
    // 2. Create initial Composer Task
    // Deadlines: standard is given 3 days. We can calculate this. Wait, let's just leave it null for now, or add 3 days.
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 3)

    await supabase.from('tasks').insert({
      project_id: project.id,
      admin_id: user.id,
      stage: 'Composer',
      title: `Composer Stage: ${formData.get('title')}`,
      description: formData.get('description'),
      admin_file_url: formData.get('file_url'),
      deadline: deadline.toISOString(),
      producer_id: null // Unassigned
    })
  }

  revalidatePath('/dashboard/tasks')
}

// Admin: Create Standalone Custom Task
export async function createCustomTask(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stages = formData.getAll('specializations').join(', ')
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 3)

  await supabase.from('tasks').insert({
    admin_id: user.id,
    stage: stages,
    title: formData.get('title'),
    description: formData.get('description'),
    admin_file_url: formData.get('file_url'),
    deadline: deadline.toISOString(),
    producer_id: null
  })

  revalidatePath('/dashboard/tasks')
}

// Admin: Approve & Advance Stage
export async function advanceStage(formData) {
  const supabase = await createClient()
  const project_id = formData.get('project_id')
  const current_stage = formData.get('current_stage')
  const next_stage = formData.get('next_stage')
  const file_url = formData.get('file_url') // the returned file from the previous stage

  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 3)

  const { data: { user } } = await supabase.auth.getUser()

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
      deadline: deadline.toISOString(),
      producer_id: null
    })
  }
  revalidatePath('/dashboard/tasks')
}

// Admin: Delete Project
export async function deleteProject(formData) {
  const supabase = await createClient()
  const project_id = formData.get('project_id')
  await supabase.from('projects').delete().eq('id', project_id)
  revalidatePath('/dashboard/tasks')
}

// Admin: Mark Project as Completed manually
export async function markProjectCompleted(formData) {
  const supabase = await createClient()
  const project_id = formData.get('project_id')
  await supabase.from('projects').update({ status: 'completed', current_stage: 'Completed' }).eq('id', project_id)

  // Also mark active tasks as completed to clean up the queue
  await supabase.from('tasks').update({ status: 'completed' }).eq('project_id', project_id).neq('status', 'completed')

  revalidatePath('/dashboard/tasks')
}

// Producer: Accept an Available Task
export async function acceptTask(formData) {
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

  // Lock the task to this user
  await supabase.from('tasks').update({ producer_id: user.id, status: 'in_progress' }).eq('id', task_id).is('producer_id', null)
  revalidatePath('/dashboard/tasks')
}

  // Producer: Complete Task
export async function completeTask(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const task_id = formData.get('task_id')
  const producer_file_url = formData.get('producer_file_url')

  // Calculate delay penalty ($1/day)
  const { data: task } = await supabase.from('tasks').select('deadline').eq('id', task_id).single()
  let penalty = 0
  if (task?.deadline) {
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
