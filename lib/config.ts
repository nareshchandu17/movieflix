/**
 * @file config.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

export const config = {
  // Database
  database: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/moviefix_otp",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // NextAuth
  auth: {
    secret: process.env.NEXTAUTH_SECRET || "default-secret-change-in-production",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Security
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    jwtExpiry: "30d",
  },

  // Application
  app: {
    name: process.env.APP_NAME || "MOVIEFLIX",
    url: process.env.APP_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },

  // Redis (for production rate limiting)
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    password: process.env.REDIS_PASSWORD,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    filePath: process.env.LOG_FILE_PATH || "./logs/app.log",
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
  },
};

// Validation functions
export const validateConfig = () => {
  const errors: string[] = [];

  // Validate required environment variables
  if (!process.env.MONGODB_URI) {
    errors.push("MONGODB_URI is required");
  }

  if (!process.env.NEXTAUTH_SECRET && config.app.environment === "production") {
    errors.push("NEXTAUTH_SECRET is required in production");
  }

  return errors;
};

// Development mode check
export const isDevelopment = config.app.environment === "development";
export const isProduction = config.app.environment === "production";

export default config;
