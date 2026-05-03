import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

function createContext(headers: Record<string, string | undefined>, request: Record<string, unknown> = {}) {
  const req = { headers, ...request };
  return {
    request: req,
    context: {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    },
  };
}

describe('AuthGuard', () => {
  it('rejects missing and malformed authorization headers', async () => {
    const guard = new AuthGuard({ validateAccessToken: jest.fn() } as any);

    await expect(guard.canActivate(createContext({}).context as any)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(createContext({ authorization: 'Basic nope' }).context as any),
    ).rejects.toThrow('Missing or invalid Authorization header');
  });

  it('rejects invalid tokens', async () => {
    const guard = new AuthGuard({
      validateAccessToken: jest.fn().mockResolvedValue(null),
    } as any);

    await expect(
      guard.canActivate(createContext({ authorization: 'Bearer bad-token' }).context as any),
    ).rejects.toThrow('Invalid or expired token');
  });

  it('attaches the authenticated user to the request', async () => {
    const authUser = { id: 'user-1', email: 'user@example.com' };
    const guard = new AuthGuard({
      validateAccessToken: jest.fn().mockResolvedValue(authUser),
    } as any);
    const { request, context } = createContext({ authorization: 'Bearer good-token' });

    await expect(guard.canActivate(context as any)).resolves.toBe(true);
    expect((request as any).user).toEqual(authUser);
  });
});
