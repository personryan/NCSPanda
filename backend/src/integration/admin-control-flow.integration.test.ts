import { UnauthorizedException } from '@nestjs/common';
import {
  authContext,
  createIntegrationHarness,
  CUSTOMER_ID,
} from './integration-test-helpers';

describe('Flow 4: Admin Control', () => {
  it('returns inactive profile state and rejects a Supabase-denied token', async () => {
    const { authGuard, prisma, supabaseAuth, usersController } = createIntegrationHarness();
    const customer = prisma.users.find((user) => user.user_id === CUSTOMER_ID);
    if (!customer) throw new Error('seeded customer missing');
    customer.is_active = false;

    supabaseAuth.validateAccessToken.mockResolvedValueOnce({
      id: CUSTOMER_ID,
      email: 'customer@example.com',
    });

    const activeTokenForInactiveProfile = authContext('Bearer still-valid-supabase-token');
    await expect(authGuard.canActivate(activeTokenForInactiveProfile.context)).resolves.toBe(true);
    await expect(usersController.getMe(activeTokenForInactiveProfile.request as any)).resolves.toMatchObject({
      user_id: CUSTOMER_ID,
      is_active: false,
      role: 'customer',
    });

    supabaseAuth.validateAccessToken.mockResolvedValueOnce(null);
    const disabledUser = authContext('Bearer disabled-supabase-token');

    await expect(authGuard.canActivate(disabledUser.context)).rejects.toThrow(UnauthorizedException);
  });
});
