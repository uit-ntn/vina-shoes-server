export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
  },
  swagger: {
    enabled: true,
    title: 'Vina Shoes API',
    description: 'The Vina Shoes API Documentation',
    version: '1.0',
    path: 'api-docs',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: process.env.PAYMENT_CURRENCY || 'vnd'
  }
});
