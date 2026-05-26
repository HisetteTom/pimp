import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn helper', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('bg-red-500', false && 'text-white', true && 'p-4')).toBe('bg-red-500 p-4');
  });

  it('should resolve tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
  });
});
