'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balances, setBalancesState] = useState<Record<string, number>>({});
  const [usernames, setUsernamesState] = useState<Record<string, string>>({});

  const handleAuthenticate = async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Authentication failed');
        return;
      }

      setIsAuthenticated(true);
      // Transform the data to match our state format
      const balances: Record<string, number> = {};
      const usernames: Record<string, string> = {};

      data.users.forEach((user: { id: string; name: string; balance: number }) => {
        // Use user.id as the key (this is the user ID)
        balances[user.id] = user.balance;
        usernames[user.id] = user.name || '';
      });

      setBalancesState(balances);
      setUsernamesState(usernames);
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to authenticate');
    }
  };

  const handleBalanceChange = (ip: string, newBalance: string) => {
    const value = parseInt(newBalance) || 0;
    setBalancesState(prev => ({
      ...prev,
      [ip]: Math.max(0, value),
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'jawnrice!', // Password is required for PUT requests too
          updates: balances,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to save changes');
        return;
      }

      alert('Balances updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Admin Panel</DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Enter admin password to manage balances:
            </div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleAuthenticate} className="w-full">
              Authenticate
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Balances</h3>
              <Button onClick={handleSaveChanges} variant="default">
                Save Changes
              </Button>
            </div>

            {Object.keys(balances).length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No user balances found.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(balances).map(([ip, balance]) => {
                  const username = usernames[ip] || 'Anonymous User';
                  return (
                    <Card key={ip}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {username} ({ip})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Balance:</span>
                          <Input
                            type="number"
                            value={balance.toString()}
                            onChange={(e) => handleBalanceChange(ip, e.target.value)}
                            className="w-24"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground">coins</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
