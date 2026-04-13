import { createClient } from '../server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Supabase Server Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy_anon_key'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('initializes with correct environment variables', async () => {
    const mockCookieStore = {
      getAll: jest.fn(),
      set: jest.fn(),
    }
    cookies.mockResolvedValue(mockCookieStore)

    // Have createServerClient return a mock
    createServerClient.mockReturnValue({ test: 'client' })

    await createClient()

    expect(createServerClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'dummy_anon_key',
      expect.any(Object)
    )
  })

  describe('cookie handling', () => {
    let cookieStore
    let cookieOptions

    beforeEach(async () => {
      cookieStore = {
        getAll: jest.fn().mockReturnValue([{ name: 'test', value: '123' }]),
        set: jest.fn(),
      }
      cookies.mockResolvedValue(cookieStore)

      await createClient()

      // Get the options passed to createServerClient
      cookieOptions = createServerClient.mock.calls[0][2].cookies
    })

    it('getAll() returns all cookies', () => {
      const result = cookieOptions.getAll()
      expect(cookieStore.getAll).toHaveBeenCalled()
      expect(result).toEqual([{ name: 'test', value: '123' }])
    })

    it('setAll() calls cookieStore.set for each cookie', () => {
      const cookiesToSet = [
        { name: 'cookie1', value: 'val1', options: { path: '/' } },
        { name: 'cookie2', value: 'val2', options: { httpOnly: true } },
      ]

      cookieOptions.setAll(cookiesToSet)

      expect(cookieStore.set).toHaveBeenCalledTimes(2)
      expect(cookieStore.set).toHaveBeenNthCalledWith(1, 'cookie1', 'val1', { path: '/' })
      expect(cookieStore.set).toHaveBeenNthCalledWith(2, 'cookie2', 'val2', { httpOnly: true })
    })

    it('setAll() safely catches and ignores errors when called from Server Components', () => {
      const cookiesToSet = [{ name: 'cookie1', value: 'val1', options: {} }]

      // Simulate calling set() from a server component where headers are read-only
      cookieStore.set.mockImplementation(() => {
        throw new Error('Cookies can only be modified in a Server Action or Route Handler.')
      })

      // This should not throw an error because of the try-catch block
      expect(() => {
        cookieOptions.setAll(cookiesToSet)
      }).not.toThrow()

      expect(cookieStore.set).toHaveBeenCalled()
    })
  })
})
