import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  mailer: process.env.EMAIL_MAILER || 'smtp',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  encryption: process.env.EMAIL_ENCRYPTION || 'TLS',
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
})); 