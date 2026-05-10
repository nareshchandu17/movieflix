import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { PasswordSecurity, LoginSecurity, DataLeakPrevention } from "@/lib/auth-security";
import { z } from "zod";

// Request validation schema
const signInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// Rate limiting schema
const rateLimitSchema = z.object({
  identifier: z.string(),
  canAttempt: z.boolean(),
  remainingAttempts: z.number().optional(),
  lockoutRemaining: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = signInSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request format",
          details: validation.error.issues.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // Check rate limiting
    const rateLimitCheck = LoginSecurity.recordAttempt(email, false);
    if (!rateLimitCheck.canAttempt) {
      DataLeakPrevention.safeLog('warn', `Login rate limit exceeded`, { 
        email, 
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Account temporarily locked.",
          lockoutRemaining: Math.ceil((rateLimitCheck.lockoutRemaining || 0) / 60000),
          retryAfter: rateLimitCheck.lockoutRemaining
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitCheck.lockoutRemaining || 0) / 1000).toString()
          }
        }
      );
    }

    await connectDB();

    // Find user with password
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password +twoFactorEnabled +twoFactorSecret +lastLogin +loginAttempts');

    if (!user) {
      DataLeakPrevention.safeLog('warn', `Login attempt with non-existent email`, { 
        email, 
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has password (OAuth users might not)
    if (!user.password) {
      DataLeakPrevention.safeLog('warn', `Password login attempt for OAuth user`, { 
        email, 
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: "This account uses Google sign-in. Please use Google to sign in." 
        },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await PasswordSecurity.verifyPassword(password, user.password);
    if (!isValidPassword) {
      DataLeakPrevention.safeLog('warn', `Failed password verification`, { 
        email, 
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = Buffer.from(JSON.stringify({
        userId: user._id.toString(),
        email: user.email,
        requiresTwoFactor: true,
        timestamp: Date.now()
      })).toString('base64');

      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        tempToken,
        message: "Please enter your 2FA code"
      });
    }

    // Successful login - record it
    LoginSecurity.recordAttempt(email, true);

    // Update last login and reset failed attempts
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    // Get existing session to check if this is a new device
    const existingSession = await getServerSession(authOptions);
    const isNewDevice = !existingSession || existingSession.user.email !== email;

    DataLeakPrevention.safeLog('info', `Successful login`, { 
      email, 
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent'),
      isNewDevice
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: DataLeakPrevention.sanitizeUserData(user.toObject()),
      isNewDevice,
      rememberMe: rememberMe
    });

  } catch (error) {
    DataLeakPrevention.safeLog('error', 'Signin API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during sign in" 
      },
      { status: 500 }
    );
  }
}

// Handle rate limit check endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

  const lockStatus = LoginSecurity.isLocked(email);
  
  return NextResponse.json({
    success: true,
    isLocked: lockStatus.isLocked,
    remainingTime: lockStatus.remainingTime ? Math.ceil(lockStatus.remainingTime / 60000) : 0
  });
}
