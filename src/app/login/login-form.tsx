'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
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
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <div className="bg-background border-primary flex min-h-screen items-center justify-center border-t-8 p-4">
      <Card className="border-primary/10 bg-card w-full max-w-md border-2 shadow-xl">
        <CardHeader className="border-primary/5 flex flex-col items-center gap-y-4 border-b pb-8">
          <div className="p-2">
            <Image src="/pimp_logo.png" alt="PIMP Logo" width={120} height={120} />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-primary text-4xl font-black tracking-tighter">
              {t('loginTitle')}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('loginArea')}
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary/80 font-bold">
                {t('email')}
              </Label>
              <div className="relative">
                <Mail className="text-primary/40 absolute top-3 left-3 size-4" />
                <Input
                  id="email"
                  type="email"
                  className="focus-visible:ring-primary border-primary/10 hover:border-primary/30 h-11 border-2 pl-10 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-primary/80 font-bold">
                  {t('password')}
                </Label>
              </div>
              <div className="relative">
                <Lock className="text-primary/40 absolute top-3 left-3 size-4" />
                <Input
                  id="password"
                  type="password"
                  className="focus-visible:ring-primary border-primary/10 hover:border-primary/30 h-11 border-2 pl-10 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 pt-4 pb-8">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full text-base font-black shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : t('signIn')}
            </Button>
            <div className="text-center text-sm font-bold">
              <span className="text-muted-foreground tracking-tight uppercase">
                {t('noAccount')}{' '}
              </span>
              <Link
                href="/register"
                className="text-secondary hover:text-primary underline decoration-2 underline-offset-4 transition-colors"
              >
                {t('createProfile')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
