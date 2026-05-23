import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function AccessDenied() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-8 dark:bg-zinc-950">
      <Card className="bg-card max-w-md rounded-none border-2 border-red-500/20 shadow-xl">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-2xl font-black tracking-tight text-red-500 uppercase">
            Access Denied
          </CardTitle>
          <CardDescription className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Professor Role Required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            You must be logged in as a professor to access this administration panel.
          </p>
          <Link
            href="/login"
            className="inline-block bg-zinc-900 px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase transition-transform active:scale-95 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Back to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
