import { MailService } from './mail.service';

describe('MailService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SMTP_HOST = '';
    process.env.SMTP_PORT = '';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  it('does not throw while booting when SMTP is not configured', () => {
    expect(() => new MailService()).not.toThrow();
  });

  it('skips sending mail when SMTP is not configured', async () => {
    const service = new MailService();

    await expect(
      service.sendContactAckToUser({
        to: 'user@example.com',
        name: 'Test User',
        phone: '9876543210',
        message: 'Hello',
      }),
    ).resolves.toBeUndefined();
  });
});
