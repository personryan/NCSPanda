import { HealthController } from './healthController';

describe('HealthController', () => {
  it('returns an ok health payload with an ISO timestamp', () => {
    const response = new HealthController().getHealth();

    expect(response.status).toBe('ok');
    expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
  });
});
