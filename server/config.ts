// server/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration object with all environment variables
export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',
  serverUrl: process.env.SERVER_URL || 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3004',

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
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

  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },

  webPush: {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3004',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // Feature Flags
  features: {
    emailNotifications: !!process.env.RESEND_API_KEY,
    smsNotifications: !!process.env.TWILIO_ACCOUNT_SID,
    pushNotifications: !!process.env.VAPID_PUBLIC_KEY,
    aiAnalysis: !!process.env.OPENAI_API_KEY,
    payments: !!process.env.STRIPE_SECRET_KEY,
  },
} as const;

// Validation function
export function validateConfig(): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Critical checks (must have)
  if (!config.supabase.url) {
    errors.push('❌ SUPABASE_URL is required');
  }
  if (!config.supabase.serviceKey) {
    errors.push('❌ SUPABASE_SERVICE_KEY is required');
  }

  // Warning checks (recommended)
  if (!config.openai.apiKey) {
    warnings.push('⚠️  OPENAI_API_KEY not set - AI features disabled');
  }
  if (!config.twilio.accountSid) {
    warnings.push('⚠️  TWILIO_ACCOUNT_SID not set - SMS features disabled');
  }
  if (!config.stripe.secretKey) {
    warnings.push('⚠️  STRIPE_SECRET_KEY not set - Payment features disabled');
  }
  if (!config.resend.apiKey) {
    warnings.push('⚠️  RESEND_API_KEY not set - Email features disabled');
  }
  if (!config.webPush.publicKey || !config.webPush.privateKey) {
    warnings.push('⚠️  VAPID keys not set - Push notifications disabled');
  }

  // Environment-specific checks
  if (config.nodeEnv === 'production') {
    if (config.serverUrl.includes('localhost')) {
      errors.push('❌ SERVER_URL cannot be localhost in production');
    }
    if (!config.frontendUrl || config.frontendUrl.includes('localhost')) {
      errors.push('❌ FRONTEND_URL must be set properly in production');
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

// Log configuration on startup
export function logConfig(): void {
  console.log('📋 Configuration Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔧 Environment: ${config.nodeEnv.toUpperCase()}`);
  console.log(`🚀 Server: ${config.serverUrl}`);
  console.log(`🎨 Frontend: ${config.frontendUrl}`);
  console.log(`🗄️  Supabase: ${config.supabase.url ? '✅ Configured' : '❌ Missing'}`);
  console.log(`📧 Email: ${config.features.emailNotifications ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`💬 SMS: ${config.features.smsNotifications ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔔 Push: ${config.features.pushNotifications ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🤖 AI: ${config.features.aiAnalysis ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`💳 Stripe: ${config.features.payments ? '✅ Enabled' : '❌ Disabled'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Print validation results
export function printValidation(): void {
  const validation = validateConfig();

  if (validation.errors.length > 0) {
    console.error('\n❌ CONFIGURATION ERRORS:');
    validation.errors.forEach((err) => console.error(`   ${err}`));
  }

  if (validation.warnings.length > 0) {
    console.warn('\n⚠️  CONFIGURATION WARNINGS:');
    validation.warnings.forEach((warn) => console.warn(`   ${warn}`));
  }

  if (validation.valid) {
    console.log('\n✅ Configuration valid!');
  }
}

export default config;
