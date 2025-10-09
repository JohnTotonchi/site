// Server-side balance management with API calls

let cachedBalance: number | null = null;
let cachedUsername: string = '';
let cachedUserId: string = '';

export async function getBalanceFromServer(): Promise<number> {
  try {
    const response = await fetch('/api/balance');
    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }

    const data = await response.json();
    cachedBalance = data.balance ?? 300;
    cachedUsername = data.username ?? '';
    cachedUserId = data.userId ?? '';
    return cachedBalance as number;
  } catch (error) {
    console.error('Failed to fetch balance from server:', error);
    return 300; // fallback
  }
}

export async function updateBalanceOnServer(amount: number): Promise<number> {
  try {
    const response = await fetch('/api/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to update balance');
    }

    const data = await response.json();
    cachedBalance = data.balance ?? cachedBalance ?? 300;
    return cachedBalance as number;
  } catch (error) {
    console.error('Failed to update balance on server:', error);
    return cachedBalance || 300;
  }
}

export async function updateUsernameOnServer(username: string): Promise<void> {
  try {
    const response = await fetch('/api/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error('Failed to update username');
    }

    const data = await response.json();
    cachedUsername = data.username;
  } catch (error) {
    console.error('Failed to update username on server:', error);
  }
}

export function getCachedBalance(): number {
  return cachedBalance || 300;
}

export function getCachedUsername(): string {
  return cachedUsername || '';
}

// Compatibility functions for client-side code
export function getClientIP(): string {
  return cachedUserId || 'anonymous';
}

export function getBalance(): number {
  return getCachedBalance();
}

export function setBalance(balance: number): void {
  cachedBalance = balance;
}

export function getUsername(): string {
  return getCachedUsername();
}

export async function setUsername(username: string): Promise<void> {
  cachedUsername = username;
  await updateUsernameOnServer(username);
}
