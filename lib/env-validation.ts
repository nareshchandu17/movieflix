/**
 * @file env-validation.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

// Environment Variable Validation
// Run this at startup to ensure all required environment variables are present

interface EnvVarConfig {
  name: string;
  required: boolean;
  clientSafe?: boolean;
}

const requiredEnvVars: EnvVarConfig[] = [
  // Database
  { name: 'MONGODB_URI', required: true },
  
  // Authentication
  { name: 'NEXTAUTH_SECRET', required: true },
  { name: 'NEXTAUTH_URL', required: false },
  { name: 'GOOGLE_CLIENT_ID', required: true },
  { name: 'GOOGLE_CLIENT_SECRET', required: true },
  
  // API Keys
  { name: 'NEXT_PUBLIC_TMDB_API_KEY', required: true, clientSafe: true },
  { name: 'GEMINI_API_KEY', required: false }, // Optional - has simulation mode
  { name: 'YOUTUBE_API_KEY', required: false }, // Optional
  { name: 'CLOUDINARY_API_KEY', required: false }, // Optional
  { name: 'CLOUDINARY_API_SECRET', required: false }, // Optional
  { name: 'UPSTASH_REDIS_REST_URL', required: false }, // Optional
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false }, // Optional
  
  // Payment
  { name: 'RAZORPAY_KEY_ID', required: false }, // Optional - has mock mode
  { name: 'RAZORPAY_KEY_SECRET', required: false }, // Optional - has mock mode
  { name: 'RAZORPAY_WEBHOOK_SECRET', required: false }, // Optional
  
  // Client-safe variables (exposed to browser)
  { name: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', required: false, clientSafe: true },
  { name: 'NEXT_PUBLIC_SOCKET_URL', required: false, clientSafe: true },
];

export function validateEnvironmentVariables(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];
    
    if (envVar.required && !value) {
      missing.push(envVar.name);
    } else if (!value && !envVar.clientSafe) {
      warnings.push(`${envVar.name} is not set (optional)`);
    }
  }


  // Report issues
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(name => console.error(`   - ${name}`));
    console.warn('⚠️ Running with missing environment variables. Request-level validation will handle missing keys at runtime.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Optional environment variables not set:');
    warnings.forEach(name => console.warn(`   - ${name}`));
  }

  // Security check for production
  if (process.env.NODE_ENV === 'production') {
    const clientSafeVars = requiredEnvVars.filter(v => v.clientSafe);
    const exposedSecrets = clientSafeVars.filter(v => {
      const value = process.env[v.name];
      return value && (v.name.includes('SECRET') || v.name.includes('KEY') || v.name.includes('TOKEN'));
    });

    if (exposedSecrets.length > 0) {
      console.error('🚨 SECURITY WARNING: Potential secrets exposed to client:');
      exposedSecrets.forEach(v => console.error(`   - ${v.name}`));
    }
  }

  if (missing.length === 0) {
    console.log('✅ All required environment variables are set');
  }
}

// Run validation immediately when module is imported
if (typeof window === 'undefined') {
  validateEnvironmentVariables();
}
