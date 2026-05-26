import { expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Fallback DATABASE_URL for unit tests to prevent database connection crashes
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://dummy:dummy@localhost:5432/dummy';

// Extend expect matchers
expect.extend(matchers);

// Silence console.error during tests to keep CI/CD test outputs pristine
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock Next.js navigation
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: (url: string) => {
      throw new Error(`Redirect to ${url}`);
    },
  };
});

// Mock Next.js headers
vi.mock('next/headers', () => {
  return {
    headers: vi.fn(async () => {
      return new Headers();
    }),
  };
});

// Mock Next.js cache
vi.mock('next/cache', () => {
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  };
});

// Clear all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
