'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createProducerAction(formData) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
  
  if (profile?.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can create users")
  }

  const email = formData.get('email')
  const password = formData.get('password')
  const name = formData.get('name')
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }

  const adminAuthClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await adminAuthClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  })

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/users')
}

export async function deleteUserAction(userId) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
  
  if (profile?.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can delete users")
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }

  const adminAuthClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await adminAuthClient.auth.admin.deleteUser(userId)
  if (error) {
    throw error
  }
  
  revalidatePath('/dashboard/users')
}
