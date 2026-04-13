import { login } from './actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('login action', () => {
  let mockSupabase

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
      },
    }
    createClient.mockResolvedValue(mockSupabase)
  })

  it('redirects to dashboard and revalidates path on successful login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

    const formData = new Map()
    formData.set('email', 'test@example.com')
    formData.set('password', 'password123')

    try {
      await login(formData)
    } catch (e) {
      if (e.message !== 'NEXT_REDIRECT') throw e
    }

    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to login with error message on failed login', async () => {
    const mockError = { message: 'Invalid credentials' }
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: mockError })

    const formData = new Map()
    formData.set('email', 'test@example.com')
    formData.set('password', 'wrongpassword')

    try {
      await login(formData)
    } catch (e) {
      if (e.message !== 'NEXT_REDIRECT') throw e
    }

    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword',
    })
    expect(redirect).toHaveBeenCalledWith('/login?error=Invalid%20credentials')
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
