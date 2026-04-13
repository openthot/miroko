import { createClient } from '@/utils/supabase/server'
import AdminTasksView from './components/AdminTasksView'
import ProducerTasksView from './components/ProducerTasksView'

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

  // For Producers: Fetch all tasks (available + assigned)
  // To handle legacy tasks without projects, we use an outer join if needed, but since we are fetching from tasks directly it's fine.
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*, projects(*), profiles!producer_id(name)')
    .order('created_at', { ascending: false })

  const myTasks = allTasks?.filter(t => t.producer_id === user.id) || []
  const availableTasks = allTasks?.filter(t => !t.producer_id && t.stage?.includes(userSpecialization) && t.status !== 'completed') || []
  const allOtherTasks = allTasks?.filter(t => !t.producer_id && !t.stage?.includes(userSpecialization) && t.status !== 'completed') || []

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">{isAdmin ? 'Project Pipeline' : 'My Production Pipeline'}</h1>
      </header>
      
      {isAdmin ? (
        <AdminTasksView projects={projects} />
      ) : (
        <ProducerTasksView
          myTasks={myTasks}
          availableTasks={availableTasks}
          allOtherTasks={allOtherTasks}
          userSpecialization={userSpecialization}
          profile={profile}
        />
      )}
    </div>
  )
}
