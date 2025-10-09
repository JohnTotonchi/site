import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { dbStatements } from '@/lib/db';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  username: string;
}

interface UserData {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface BalanceResponse {
  balance: number;
  username: string;
  userId: string;
}

interface BalanceUpdateRequest {
  amount?: number;
  username?: string;
}

// Get user ID from request (JWT cookie or create anonymous user)
async function getUserFromRequest(request: NextRequest) {
  try {
    // Try to get JWT token from cookies
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.auth_token;

    if (token) {
      // Verify token and return user
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    }
  } catch (error) {
    // Token invalid, fall through to create new user
  }

  // Create anonymous user with random ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const username = `User${Math.floor(Math.random() * 10000)}`;

  // Try to create user in database
  try {
    dbStatements.createUser.run(userId, username);

    // Create JWT token
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '30d' });

    return { userId, username, token };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}

// GET /api/balance - Get current user's balance
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if ('token' in user) {
      // New user created, return with token cookie
      const userData = dbStatements.getUser.get(user.userId) as UserData | undefined;

      // Ensure user data exists (should be set by getUserFromRequest)
      if (!userData) {
        // User creation might have failed, try to create again
        try {
          dbStatements.createUser.run(user.userId, user.username);
          const freshUserData = dbStatements.getUser.get(user.userId) as UserData | undefined;
          if (!freshUserData) {
            throw new Error('Failed to create user');
          }
        } catch (err) {
          console.error('Failed to create user on retry:', err);
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }
      }

      const finalUserData = dbStatements.getUser.get(user.userId) as UserData | undefined;

      const response = NextResponse.json({
        balance: finalUserData?.balance || 300,
        username: finalUserData?.username || user.username,
        userId: user.userId
      });

      response.cookies.set('auth_token', user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });

      return response;
    }

    // Existing user
    let userData = dbStatements.getUser.get(user.userId) as UserData | undefined;

    if (!userData) {
      // User exists in JWT but not in database - this shouldn't happen normally
      // but could occur if database was wiped or user was deleted
      // Re-create the user with default balance
      console.log(`User ${user.userId} not found in database, recreating...`);
      try {
        dbStatements.createUser.run(user.userId, user.username);
        userData = dbStatements.getUser.get(user.userId) as UserData | undefined;

        if (!userData) {
          // Still failed, return fallback
          console.error(`Failed to recreate user ${user.userId}`);
          return NextResponse.json({
            balance: 300,
            username: user.username,
            userId: user.userId
          });
        }
      } catch (err) {
        console.error(`Failed to recreate user ${user.userId}:`, err);
        return NextResponse.json({
          balance: 300,
          username: user.username,
          userId: user.userId
        });
      }
    }

    const response: BalanceResponse = {
      balance: userData.balance,
      username: userData.username,
      userId: user.userId
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/balance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/balance - Update balance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BalanceUpdateRequest;
    const { amount, username } = body;

    const user = await getUserFromRequest(request);

    if (!('userId' in user)) {
      throw new Error('Unauthorized');
    }

    // Update balance if amount provided
    if (typeof amount === 'number') {
      let currentUser = dbStatements.getUser.get(user.userId) as UserData | undefined;
      if (!currentUser) {
        // User exists in JWT but not in database - recreate them
        console.log(`User ${user.userId} not found in database during POST, recreating...`);
        try {
          dbStatements.createUser.run(user.userId, user.username);
          currentUser = dbStatements.getUser.get(user.userId) as UserData | undefined;
          if (!currentUser) {
            console.error(`Failed to recreate user ${user.userId} during POST balance update`);
            // Continue with username update only, don't update balance
          } else {
            const newBalance = Math.max(0, currentUser.balance + amount);
            dbStatements.updateBalance.run(newBalance, user.userId);
          }
        } catch (err) {
          console.error(`Failed to recreate user ${user.userId} during POST:`, err);
          // Continue with username update only
        }
      } else {
        const newBalance = Math.max(0, currentUser.balance + amount);
        dbStatements.updateBalance.run(newBalance, user.userId);
      }
    }

    // Update username if provided
    if (username && typeof username === 'string' && username.trim()) {
      try {
        dbStatements.updateUsername.run(username.trim(), user.userId);
      } catch (err) {
        console.log('Username update failed, ignoring:', err);
        // Username taken, ignore for now
      }
    }

    // Get updated user data
    const updatedUser = dbStatements.getUser.get(user.userId) as UserData | undefined;

    const response: BalanceResponse = {
      balance: updatedUser?.balance ?? 300,
      username: updatedUser?.username ?? 'Anonymous',
      userId: user.userId
    };

    return NextResponse.json(response);

  } catch (err) {
    console.error('POST /api/balance error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
