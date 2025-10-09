import { NextRequest, NextResponse } from 'next/server';
import { dbStatements } from '@/lib/db';

// Simple admin password check
const ADMIN_PASSWORD = 'jawnrice!';

interface AdminRequest {
  password: string;
}

interface AdminResponse {
  users: {
    id: string;
    name: string;
    balance: number;
  }[];
}

// POST /api/admin - Get all users for admin panel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AdminRequest;
    const { password } = body;

    // Check admin password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    // Get all users
    const users = dbStatements.getAllUsers.all() as {
      id: string;
      username: string;
      balance: number;
      created_at: string;
      updated_at: string;
    }[];

    const userData = users.map(user => ({
      id: user.id,
      name: user.username,
      balance: user.balance
    }));

    const data: AdminResponse = { users: userData };
    return NextResponse.json(data);

  } catch (err) {
    console.error('POST /api/admin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface AdminUpdateRequest {
  password: string;
  updates: Record<string, number>;
}

interface AdminUpdateResponse {
  success: boolean;
}

// PUT /api/admin - Update user balances for admin panel
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as AdminUpdateRequest;
    const { password, updates } = body;

    // Check admin password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    // Validate updates format
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 });
    }

    // Update each user's balance
    for (const [userId, newBalance] of Object.entries(updates)) {
      if (typeof newBalance === 'number') {
        dbStatements.updateBalance.run(Math.max(0, newBalance), userId);
      }
    }

    const response: AdminUpdateResponse = { success: true };
    return NextResponse.json(response);

  } catch (err) {
    console.error('PUT /api/admin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
