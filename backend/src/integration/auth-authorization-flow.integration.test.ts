import { UnauthorizedException } from '@nestjs/common';
import {
  authContext,
  createIntegrationHarness,
  CUSTOMER_ID,
} from './integration-test-helpers';

describe('Flow 3: Authentication / Authorization', () => {
  it('allows valid Supabase tokens through protected routes and rejects invalid tokens', async () => {
    const { authGuard, supabaseAuth, usersController } = createIntegrationHarness();

    supabaseAuth.validateAccessToken.mockResolvedValueOnce({
      id: CUSTOMER_ID,
      email: 'customer@example.com',
    });

    const valid = authContext('Bearer valid-supabase-token');
    await expect(authGuard.canActivate(valid.context)).resolves.toBe(true);

    await expect(usersController.getMe(valid.request as any)).resolves.toMatchObject({
      user_id: CUSTOMER_ID,
      email: 'customer@example.com',
      role: 'customer',
      is_active: true,
    });

    supabaseAuth.validateAccessToken.mockResolvedValueOnce(null);
    const invalid = authContext('Bearer invalid-token');

    await expect(authGuard.canActivate(invalid.context)).rejects.toThrow(UnauthorizedException);
  });
});
