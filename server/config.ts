// server/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY,
  },

  // External APIs
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
};

// Validation
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Missing environment variable: ${varName}`);
  }
});

export default config;
