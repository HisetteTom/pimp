'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Global application error boundary page fallback.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-y-4 p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
        Something went wrong!
      </h2>
      <p className="mb-4 font-medium text-zinc-500 italic dark:text-zinc-400">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <Button onClick={() => reset()} className="font-semibold tracking-wider uppercase">
        Try again
      </Button>
    </div>
  );
}
