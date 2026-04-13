import { createProducerAction } from './actions'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('createProducerAction', () => {
  const mockFormData = new Map([
    ['email', 'test@example.com'],
    ['password', 'password123'],
    ['name', 'Test Producer'],
    ['specialization', 'Mixing']
  ]);

  const formData = {
    get: (key) => mockFormData.get(key)
  };

  let mockStandardSupabaseClient;
  let mockAdminSupabaseClient;
  let originalEnv;
  let consoleErrorMock;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SUPABASE_SERVICE_ROLE_KEY: 'mock-service-key',
      NEXT_PUBLIC_SUPABASE_URL: 'mock-url'
    };

    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup default mock responses for success path
    mockStandardSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } })
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { role: 'admin' } })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({})
        })
      })
    };

    mockAdminSupabaseClient = {
      auth: {
        admin: {
          createUser: jest.fn().mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null })
        }
      }
    };

    createClient.mockResolvedValue(mockStandardSupabaseClient);
    createAdmin.mockReturnValue(mockAdminSupabaseClient);
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleErrorMock.mockRestore();
  });

  it('successfully creates a producer when user is admin', async () => {
    let localActions;
    jest.isolateModules(() => {
      localActions = require('./actions');
    });

    await localActions.createProducerAction(formData);

    expect(createClient).toHaveBeenCalled();
    expect(mockStandardSupabaseClient.auth.getUser).toHaveBeenCalled();
    expect(mockStandardSupabaseClient.from).toHaveBeenCalledWith('profiles');

    expect(createAdmin).toHaveBeenCalledWith(
      'mock-url',
      'mock-service-key',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    expect(mockAdminSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Test Producer' }
    });

    expect(mockStandardSupabaseClient.from).toHaveBeenCalledWith('profiles');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/users');
  });

  it('fails if user is not authenticated', async () => {
    mockStandardSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    let localActions;
    jest.isolateModules(() => {
      localActions = require('./actions');
    });

    await expect(localActions.createProducerAction(formData)).rejects.toThrow("Not authenticated");
    expect(mockAdminSupabaseClient.auth.admin.createUser).not.toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('fails if user is not an admin', async () => {
    mockStandardSupabaseClient.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { role: 'producer' } })
        })
      })
    });

    let localActions;
    jest.isolateModules(() => {
      localActions = require('./actions');
    });

    await expect(localActions.createProducerAction(formData)).rejects.toThrow("Unauthorized: Only admins can perform this action");
    expect(mockAdminSupabaseClient.auth.admin.createUser).not.toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('fails if SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    let localActions;
    jest.isolateModules(() => {
      localActions = require('./actions');
    });

    await expect(localActions.createProducerAction(formData)).rejects.toThrow("Missing SUPABASE_SERVICE_ROLE_KEY");
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('fails if createUser fails', async () => {
    mockAdminSupabaseClient.auth.admin.createUser.mockResolvedValueOnce({
      data: null,
      error: new Error("Create user failed")
    });

    let localActions;
    jest.isolateModules(() => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
      localActions = require('./actions');
    });

    await expect(localActions.createProducerAction(formData)).rejects.toThrow("Create user failed");
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});
