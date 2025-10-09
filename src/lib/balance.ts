export const COOKIE_NAME = 'ride_the_bus_balance';
export const USERNAME_COOKIE_NAME = 'ride_the_bus_username';
export const COOKIE_EXPIRES_DAYS = 365;

export function getClientIP(): string {
  // In a real application, you'd get the IP from the request headers
  // For client-side, we'll use a fallback like user agent or similar
  // Since we can't get IP client-side, we'll use a hashed user agent
  const userAgent = navigator.userAgent;
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

export function getBalance(): number {
  if (typeof window === 'undefined') return 300;

  const clientIP = getClientIP();
  const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME && value.startsWith(`${clientIP}:`)) {
      const balance = parseInt(value.split(':')[1]);
      return isNaN(balance) ? 300 : Math.max(0, balance);
    }
  }

  return 300; // Default starting balance
}

export function setBalance(balance: number): void {
  if (typeof window === 'undefined') return;

  const clientIP = getClientIP();
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRES_DAYS);

  document.cookie = `${COOKIE_NAME}=${clientIP}:${Math.max(0, balance)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function getAllBalances(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  const cookies = document.cookie.split(';');
  const balances: Record<string, number> = {};

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      const [ip, balanceStr] = value.split(':');
      const balance = parseInt(balanceStr);
      if (!isNaN(balance)) {
        balances[ip] = Math.max(0, balance);
      }
    }
  }

  return balances;
}

export function setAllBalances(balances: Record<string, number>): void {
  if (typeof window === 'undefined') return;

  // Clear existing cookies
  const expires = new Date();
  expires.setDate(expires.getDate() - 1);
  document.cookie = `${COOKIE_NAME}=; expires=${expires.toUTCString()}; path=/`;

  // Set new balances
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + COOKIE_EXPIRES_DAYS);

  for (const [ip, balance] of Object.entries(balances)) {
    document.cookie = `${COOKIE_NAME}=${ip}:${Math.max(0, balance)}; expires=${futureDate.toUTCString()}; path=/; SameSite=Lax`;
  }
}

export function getUsername(): string {
  if (typeof window === 'undefined') return '';

  const clientIP = getClientIP();
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === USERNAME_COOKIE_NAME && value.startsWith(`${clientIP}:`)) {
      return value.split(':')[1] || '';
    }
  }

  return '';
}

export function setUsername(username: string): void {
  if (typeof window === 'undefined') return;

  const clientIP = getClientIP();
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRES_DAYS);

  document.cookie = `${USERNAME_COOKIE_NAME}=${clientIP}:${username}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function getAllUsernames(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const cookies = document.cookie.split(';');
  const usernames: Record<string, string> = {};

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === USERNAME_COOKIE_NAME) {
      const [ip, username] = value.split(':');
      usernames[ip] = username || '';
    }
  }

  return usernames;
}

export function setAllUsernames(usernames: Record<string, string>): void {
  if (typeof window === 'undefined') return;

  // Clear existing username cookies
  const expires = new Date();
  expires.setDate(expires.getDate() - 1);
  document.cookie = `${USERNAME_COOKIE_NAME}=; expires=${expires.toUTCString()}; path=/`;

  // Set new usernames
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + COOKIE_EXPIRES_DAYS);

  for (const [ip, username] of Object.entries(usernames)) {
    document.cookie = `${USERNAME_COOKIE_NAME}=${ip}:${username}; expires=${futureDate.toUTCString()}; path=/; SameSite=Lax`;
  }
}
