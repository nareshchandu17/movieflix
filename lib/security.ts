import { NextResponse } from "next/server";
import rateLimit from "express-rate-limit";

// In-memory store for rate limiting (use Redis in production)
const store = new Map();

// Rate limit configurations
const createRateLimit = (windowMs, max, message) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (store.has(key)) {
      const requests = store.get(key).filter(time => time > windowStart);
      store.set(key, requests);
    }
    
    // Check current requests
    const requests = store.get(key) || [];
    
    if (requests.length >= max) {
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }
    
    // Add current request
    requests.push(now);
    store.set(key, requests);
    
    next();
  };
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 requests
  "Too many authentication attempts, please try again later."
);

export const otpRateLimit = createRateLimit(
  10 * 60 * 1000, // 10 minutes
  5, // 5 requests
  "Too many OTP requests, please try again later."
);

export const verifyRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  15, // 15 requests
  "Too many verification attempts, please try again later."
);

// Security headers middleware
export function addSecurityHeaders(handler) {
  return async (req, res) => {
    // Add security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // CORS headers (adjust as needed)
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGINS || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    
    return handler(req, res);
  };
}

// Input validation middleware
export function validatePhone(req, res, next) {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required"
    });
  }
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Basic validation
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return res.status(400).json({
      success: false,
      error: "Invalid phone number format"
    });
  }
  
  req.body.phone = cleanPhone;
  next();
}

export function validateOTP(req, res, next) {
  const { otp } = req.body;
  
  if (!otp) {
    return res.status(400).json({
      success: false,
      error: "OTP is required"
    });
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      error: "OTP must be 6 digits"
    });
  }
  
  next();
}

// IP blocking middleware
export function blockSuspiciousIPs(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // You can implement your own logic here to block suspicious IPs
  // For example, maintain a list of blocked IPs in database
  
  // For now, just log the IP for monitoring
  console.log(`Request from IP: ${clientIP}`);
  
  next();
}

export default {
  authRateLimit,
  otpRateLimit,
  verifyRateLimit,
  addSecurityHeaders,
  validatePhone,
  validateOTP,
  blockSuspiciousIPs,
};
