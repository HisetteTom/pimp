'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function SettingsView({ initialLocale }: { initialLocale: string }) {
  const t = useTranslations('Settings');
  const [locale, setLocale] = React.useState(initialLocale);
  const [isPending, startTransition] = React.useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Set the standard next-intl cookie
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;

        toast.success(t('success'));

        // Perform a hard refresh to force Next.js to reconstruct the Server Components with the new locale
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.reload();
      } catch {
        toast.error('Failed to update language');
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-zinc-150 border shadow-xs dark:border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {t('language')}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t('languageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="language-select"
              className="text-xs font-bold text-zinc-700 uppercase dark:text-zinc-300"
            >
              {t('language')}
            </Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger
                id="language-select"
                className="w-full max-w-xs border-zinc-200 bg-white shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
              >
                <SelectValue placeholder={t('language')} />
              </SelectTrigger>
              <SelectContent className="border border-zinc-200 dark:border-zinc-800">
                <SelectItem value="fr" className="font-medium text-zinc-800 dark:text-zinc-200">
                  🇫🇷 {t('french')}
                </SelectItem>
                <SelectItem value="en" className="font-medium text-zinc-800 dark:text-zinc-200">
                  🇬🇧 {t('english')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="dark:border-zinc-850 flex justify-end border-t border-zinc-100 pt-4">
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-purple-600 font-black tracking-wider text-white uppercase transition-all hover:bg-purple-700 active:scale-[0.98]"
            >
              {isPending ? '...' : t('save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
