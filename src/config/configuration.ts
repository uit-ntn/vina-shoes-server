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
  }
});
