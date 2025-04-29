export default {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: '24h',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/ecommerce',
  PORT: process.env.PORT || 3001
}; 