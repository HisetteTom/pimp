'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-y-4 p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
        Something went wrong!
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 font-medium italic mb-4">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <Button
        onClick={() => reset()}
        className="font-semibold uppercase tracking-wider"
      >
        Try again
      </Button>
    </div>
  );
}
