/**
 * Authentication API Handlers
 * Handles user login and signup
 */

import { Context, HttpRequest } from "@azure/functions";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Mock user database
const users: Map<string, { id: string; email: string; password: string; firstName: string; lastName: string }> = new Map([
  [
    "user@example.com",
    {
      id: "user-001",
      email: "user@example.com",
      password: "hashedpassword123", // In production: use bcrypt
      firstName: "John",
      lastName: "Doe",
    },
  ],
]);

/**
 * Mock JWT generation (replace with real JWT in production)
 */
function generateToken(userId: string): { token: string; refreshToken: string } {
  const token = Buffer.from(JSON.stringify({ userId, type: "access", iat: Date.now() })).toString("base64");
  const refreshToken = Buffer.from(JSON.stringify({ userId, type: "refresh", iat: Date.now() })).toString("base64");
  return { token, refreshToken };
}

/**
 * POST /api/auth/login
 * User login endpoint
 * Request body: { email: string; password: string }
 */
export async function authLogin(context: Context, req: HttpRequest): Promise<void> {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, body: { success: false, error: "Method not allowed" } };
      return;
    }

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      context.res = {
        status: 400,
        body: { success: false, error: "Email and password are required" },
      };
      return;
    }

    // Find user
    const user = users.get(email);
    if (!user || user.password !== password) {
      context.res = {
        status: 401,
        body: { success: false, error: "Invalid email or password" },
      };
      return;
    }

    // Generate tokens
    const { token, refreshToken } = generateToken(user.id);

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      refreshToken,
      expiresIn: 900, // 15 minutes
    };

    context.res = {
      status: 200,
      body: { success: true, data: response } as ApiResponse<AuthResponse>,
    };
  } catch (error: any) {
    context.log.error("authLogin error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to login" },
    };
  }
}

/**
 * POST /api/auth/signup
 * User registration endpoint
 * Request body: { email: string; password: string; firstName: string; lastName: string }
 */
export async function authSignup(context: Context, req: HttpRequest): Promise<void> {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, body: { success: false, error: "Method not allowed" } };
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      context.res = {
        status: 400,
        body: { success: false, error: "All fields (email, password, firstName, lastName) are required" },
      };
      return;
    }

    // Check if user exists
    if (users.has(email)) {
      context.res = {
        status: 409,
        body: { success: false, error: "Email already registered" },
      };
      return;
    }

    // Create user
    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      email,
      password, // In production: hash with bcrypt
      firstName,
      lastName,
    };

    users.set(email, newUser);

    // Generate tokens
    const { token, refreshToken } = generateToken(userId);

    const response: AuthResponse = {
      user: {
        id: userId,
        email,
        firstName,
        lastName,
      },
      token,
      refreshToken,
      expiresIn: 900,
    };

    context.res = {
      status: 201,
      body: { success: true, data: response } as ApiResponse<AuthResponse>,
    };
  } catch (error: any) {
    context.log.error("authSignup error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to signup" },
    };
  }
}

/**
 * Export users storage for testing
 */
export function getUsersStorage() {
  return users;
}
