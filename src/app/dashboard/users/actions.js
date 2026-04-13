'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { validatePassword, PASSWORD_REQUIREMENTS } from '@/utils/password-validation'

// Initialize Admin Client once to avoid memory leaks and re-creation issues
let adminClient;
const getAdminClient = () => {
  if (adminClient) return adminClient;
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }
  
  adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return adminClient;
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Not authenticated")
  
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profileError) {
    throw new Error("Error fetching profile")
  }

  if (!profile || profile.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can perform this action")
  }
  return user
}

export async function createProducerAction(formData) {
  try {
    const adminUser = await checkAdmin()
    
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('name')
    const specialization = formData.get('specialization')

    if (!validatePassword(password)) {
      throw new Error(PASSWORD_REQUIREMENTS)
    }
    
    const adminAuthClient = getAdminClient()

    const { data, error } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (error) throw error
    
    // Explicitly update profile created by DB trigger to bypass Onboarding flow
    const supabase = await createClient()
    await supabase.from('profiles').update({
      specializations: [specialization],
      onboarding_completed: true
    }).eq('id', data.user.id)

    revalidatePath('/dashboard/users')
  } catch (err) {
    console.error("Create User Error:", err)
    throw err
  }
}

export async function deleteUserAction(userId) {
  try {
    await checkAdmin()
    
    const adminAuthClient = getAdminClient()
    const { error } = await adminAuthClient.auth.admin.deleteUser(userId)
    
    if (error) throw error
    revalidatePath('/dashboard/users')
  } catch (err) {
    console.error("Delete User Error:", err)
    throw err
  }
}
