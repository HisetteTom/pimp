'use client';

import { useReducer } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, AtSign, Mail, Lock, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';

type State = {
  email: string;
  password: string;
  username: string;
  role: string;
  promo: string;
  loading: boolean;
};

type Action =
  | { type: 'SET_FIELD'; field: keyof State; value: string | boolean }
  | { type: 'SET_LOADING'; value: boolean };

const initialState: State = {
  email: '',
  password: '',
  username: '',
  role: 'student',
  promo: 'ISEN1',
  loading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    default:
      return state;
  }
}

/**
 * Student/Professor registration page form.
 */
export function RegisterForm() {
  const t = useTranslations('Auth');
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', value: true });
    const { error } = await authClient.signUp.email({
      email: state.email,
      password: state.password,
      name: state.username,
      username: state.username,
      // @ts-expect-error: Role is dynamically passed from form state
      role: state.role,
      promo: state.role === 'student' ? state.promo : undefined,
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/';
    }
    dispatch({ type: 'SET_LOADING', value: false });
  };

  return (
    <div className="bg-background border-secondary flex min-h-screen items-center justify-center border-t-8 p-4">
      <Card className="border-secondary/10 bg-card w-full max-w-xl border-2 shadow-xl">
        <CardHeader className="border-secondary/5 flex flex-col items-center gap-y-4 border-b pb-6">
          <div className="p-2">
            <Image src="/pimp_logo.png" alt="PIMP Logo" width={110} height={110} />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-secondary text-4xl font-black tracking-tighter">
              {t('loginTitle')}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('platformRegistration')}
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-6 pt-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-secondary/80 font-bold">
                {t('username')}
              </Label>
              <div className="relative">
                <AtSign className="text-secondary/40 absolute top-3 left-3 size-4" />
                <Input
                  id="username"
                  className="border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 h-10 border-2 pl-10 transition-colors"
                  value={state.username}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'username', value: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email" className="text-secondary/80 font-bold">
                {t('email')}
              </Label>
              <div className="relative">
                <Mail className="text-secondary/40 absolute top-3 left-3 size-4" />
                <Input
                  id="email"
                  type="email"
                  className="border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 h-10 border-2 pl-10 transition-colors"
                  value={state.email}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password" className="text-secondary/80 font-bold">
                {t('password')}
              </Label>
              <div className="relative">
                <Lock className="text-secondary/40 absolute top-3 left-3 size-4" />
                <Input
                  id="password"
                  type="password"
                  className="border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 h-10 border-2 pl-10 transition-colors"
                  value={state.password}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="promo" className="text-secondary/80 font-bold">
                {t('yourPromo')}
              </Label>
              <Select
                value={state.promo}
                onValueChange={(value) => dispatch({ type: 'SET_FIELD', field: 'promo', value })}
              >
                <SelectTrigger className="border-secondary/10 focus:ring-secondary focus:border-secondary hover:border-secondary/30 relative h-10 border-2 pl-10 transition-colors">
                  <GraduationCap className="text-secondary/40 absolute top-3 left-3 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISEN1" className="focus:bg-secondary/10 focus:text-secondary">
                    ISEN 1
                  </SelectItem>
                  <SelectItem value="ISEN2" className="focus:bg-secondary/10 focus:text-secondary">
                    ISEN 2
                  </SelectItem>
                  <SelectItem value="ISEN3" className="focus:bg-secondary/10 focus:text-secondary">
                    ISEN 3
                  </SelectItem>
                  <SelectItem value="ISEN4" className="focus:bg-secondary/10 focus:text-secondary">
                    ISEN 4
                  </SelectItem>
                  <SelectItem value="ISEN5" className="focus:bg-secondary/10 focus:text-secondary">
                    ISEN 5
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 pt-4 pb-8">
            <Button
              type="submit"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 w-full text-base font-black shadow-[4px_4px_0px_0px_rgba(var(--secondary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              disabled={state.loading}
            >
              {state.loading ? <Loader2 className="size-5 animate-spin" /> : t('createAccount')}
            </Button>
            <div className="text-center text-sm font-bold">
              <span className="text-muted-foreground tracking-tight uppercase">
                {t('alreadyRegistered')}{' '}
              </span>
              <Link
                href="/login"
                className="text-primary hover:text-secondary underline decoration-2 underline-offset-4 transition-colors"
              >
                {t('signIn')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
