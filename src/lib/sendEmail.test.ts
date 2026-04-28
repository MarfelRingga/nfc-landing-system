import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendWelcomeEmail } from './sendEmail';
import nodemailer from 'nodemailer';

// Mock nodemailer
vi.mock('nodemailer', () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mock-message-id' });
  return {
    default: {
      createTransport: vi.fn().mockReturnValue({
        sendMail: sendMailMock,
      }),
    },
  };
});

// Since the nodemailer mock is inside vi.mock, we need to extract the mock function to assert it.
const mockSendMail = nodemailer.createTransport().sendMail;

describe('sendWelcomeEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully send a welcome email', async () => {
    process.env.SMTP_EMAIL = 'hello@rifelo.id';
    process.env.SMTP_PASSWORD = 'fakepassword';

    const result = await sendWelcomeEmail('user@example.com', 'John Doe');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('mock-message-id');

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'hello@rifelo.id',
        pass: 'fakepassword',
      },
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Rifelo Team" <hello@rifelo.id>',
        to: 'user@example.com',
        subject: 'Welcome to Rifelo! 🎉',
        html: expect.stringContaining('Hi John Doe,'), // Validates template is used
      })
    );
  });
});
