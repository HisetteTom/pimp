'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateFirstLoginPassword } from './actions';
import Image from 'next/image';
import { Loader2, Lock, KeyRound } from 'lucide-react';

export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    startTransition(async () => {
      try {
        await updateFirstLoginPassword(password);
        toast.success('Password updated successfully!');
        window.location.href = '/';
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update password';
        toast.error(message);
      }
    });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center border-t-8 border-purple-600 p-4">
      <Card className="bg-card w-full max-w-md rounded-none border-2 border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="flex flex-col items-center gap-y-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <div className="p-2">
            <Image src="/pimp_logo.png" alt="PIMP Logo" width={90} height={90} />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-3xl font-black tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
              Security Update
            </CardTitle>
            <CardDescription className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
              First Login Password Change
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5 pt-6">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-black tracking-wider text-zinc-500 uppercase"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 rounded-none border-2 border-zinc-200 pl-10 focus-visible:border-purple-600 focus-visible:ring-purple-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-black tracking-wider text-zinc-500 uppercase"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 rounded-none border-2 border-zinc-200 pl-10 focus-visible:border-purple-600 focus-visible:ring-purple-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-6">
            <Button
              type="submit"
              className="h-12 w-full rounded-none bg-purple-600 text-base font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-5 animate-spin" /> : 'UPDATE MY PASSWORD'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
