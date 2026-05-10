import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { PasswordSecurity, LoginSecurity, DataLeakPrevention } from "@/lib/auth-security";
import { z } from "zod";

// Request validation schema
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be 50 characters or less"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = signUpSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request format",
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { name, email, password, acceptTerms } = validation.data;

    // Check rate limiting for signup
    const rateLimitCheck = LoginSecurity.recordAttempt(email, false);
    if (!rateLimitCheck.canAttempt) {
      DataLeakPrevention.safeLog('warn', `Signup rate limit exceeded`, { 
        email, 
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        {
          success: false,
          error: "Too many signup attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimitCheck.lockoutRemaining || 0) / 60000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitCheck.lockoutRemaining || 0) / 1000).toString()
          }
        }
      );
    }

    // Validate password strength
    const passwordValidation = PasswordSecurity.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Password does not meet security requirements",
          passwordStrength: passwordValidation,
          feedback: passwordValidation.feedback
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: name.toLowerCase().trim() }
      ]
    });

    if (existingUser) {
      DataLeakPrevention.safeLog('warn', `Signup attempt with existing email/username`, { 
        email, 
        name,
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: existingUser.email === email.toLowerCase().trim() 
            ? "An account with this email already exists" 
            : "This username is already taken"
        },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await PasswordSecurity.hashPassword(password);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      onboardingCompleted: false,
      subscription: "none",
      subscriptionStatus: "inactive",
      role: "user",
      preferences: {
        genres: [],
        language: "English"
      },
      interests: [],
      moods: [],
      profilesLimit: 5,
      lastLogin: new Date(),
      loginAttempts: 0
    });

    await newUser.save();

    // Record successful signup
    LoginSecurity.recordAttempt(email, true);

    DataLeakPrevention.safeLog('info', `New user registered`, { 
      email, 
      name,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: DataLeakPrevention.sanitizeUserData(newUser.toObject()),
      nextStep: "onboarding"
    });

  } catch (error) {
    DataLeakPrevention.safeLog('error', 'Signup API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Check for duplicate key error (MongoDB)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: "An account with this email already exists" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during registration" 
      },
      { status: 500 }
    );
  }
}
