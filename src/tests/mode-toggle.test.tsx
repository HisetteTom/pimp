import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle } from '@/components/mode-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
vi.mock('next-themes', () => {
  return {
    useTheme: vi.fn(),
  };
});

describe('ModeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      forcedTheme: undefined,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
    });

    render(<ModeToggle />);
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('calls setTheme with "dark" when theme is "light" and button is clicked', () => {
    const setThemeMock = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
      forcedTheme: undefined,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
    });

    render(<ModeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when theme is "dark" and button is clicked', () => {
    const setThemeMock = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: setThemeMock,
      forcedTheme: undefined,
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
    });

    render(<ModeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(setThemeMock).toHaveBeenCalledWith('light');
  });
});
