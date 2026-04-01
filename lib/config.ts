// Central configuration file for the OTP authentication system

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

  // OTP Configuration
  otp: {
    expirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS || "120"), // 2 minutes
    rateLimit: parseInt(process.env.OTP_RATE_LIMIT || "5"), // 5 requests per window
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || "5"),
    length: 6,
    resendCooldown: 30, // 30 seconds before allowing resend
  },

  // Rate Limiting Windows (in milliseconds)
  rateLimitWindows: {
    otp: 10 * 60 * 1000, // 10 minutes
    verify: 5 * 60 * 1000, // 5 minutes
    auth: 15 * 60 * 1000, // 15 minutes
  },

  // SMS Provider
  sms: {
    provider: process.env.SMS_PROVIDER || "development", // twilio, msg91, fast2sms, development
    
    // Twilio
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    
    // MSG91
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY,
      senderId: process.env.MSG91_SENDER_ID,
    },
    
    // Fast2SMS
    fast2sms: {
      apiKey: process.env.FAST2SMS_API_KEY,
    },
  },

  // Security
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    bcryptRounds: 12,
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
    url: process.env.REDIS_URL || "redis://localhost:6379",
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

  if (config.app.environment === "production") {
    if (!process.env.SMS_PROVIDER || process.env.SMS_PROVIDER === "development") {
      errors.push("SMS_PROVIDER must be configured in production");
    }
  }

  // Validate SMS provider configuration
  if (config.sms.provider === "twilio") {
    if (!config.sms.twilio.accountSid || !config.sms.twilio.authToken || !config.sms.twilio.phoneNumber) {
      errors.push("Twilio configuration is incomplete");
    }
  } else if (config.sms.provider === "msg91") {
    if (!config.sms.msg91.authKey || !config.sms.msg91.senderId) {
      errors.push("MSG91 configuration is incomplete");
    }
  } else if (config.sms.provider === "fast2sms") {
    if (!config.sms.fast2sms.apiKey) {
      errors.push("Fast2SMS configuration is incomplete");
    }
  }

  return errors;
};

// Development mode check
export const isDevelopment = config.app.environment === "development";
export const isProduction = config.app.environment === "production";

export default config;
