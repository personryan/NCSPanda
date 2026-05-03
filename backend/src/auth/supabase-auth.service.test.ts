const getUser = jest.fn();
const createClient = jest.fn(() => ({
  auth: { getUser },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient,
}));

describe('SupabaseAuthService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'anon-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('requires Supabase configuration', async () => {
    delete process.env.SUPABASE_URL;
    const { SupabaseAuthService } = await import('./supabase-auth.service');

    expect(() => new SupabaseAuthService()).toThrow(
      'SUPABASE_URL and SUPABASE_ANON_KEY must be set',
    );
  });

  it('returns auth user details for valid access tokens', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-1', email: 'user@example.com' } },
      error: null,
    });
    const { SupabaseAuthService } = await import('./supabase-auth.service');

    const service = new SupabaseAuthService();

    await expect(service.validateAccessToken('token')).resolves.toEqual({
      id: 'auth-user-1',
      email: 'user@example.com',
    });
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key');
    expect(getUser).toHaveBeenCalledWith('token');
  });

  it('returns null when Supabase rejects the token or omits the user', async () => {
    const { SupabaseAuthService } = await import('./supabase-auth.service');
    const service = new SupabaseAuthService();

    getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('expired') });
    await expect(service.validateAccessToken('expired')).resolves.toBeNull();

    getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(service.validateAccessToken('missing')).resolves.toBeNull();
  });
});
