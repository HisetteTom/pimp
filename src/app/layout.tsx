import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono, DM_Sans, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const nunitoSansHeading = Nunito_Sans({ subsets: ['latin'], variable: '--font-heading' });

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'PIMP - Projet de fin d’année',
    template: '%s | PIMP',
  },
  description: 'Plateforme de gestion et suivi des projets étudiants',
  icons: {
    icon: '/pimp_favicon.ico',
  },
};

import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        dmSans.variable,
        nunitoSansHeading.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
