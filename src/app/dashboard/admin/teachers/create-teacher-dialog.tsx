'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTeacher } from '../actions';
import { Loader2, Plus, Mail, Lock, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CreateTeacherDialog() {
  const t = useTranslations('AdminCreateTeacher');
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error(t('fieldsRequired'));
      return;
    }

    startTransition(async () => {
      try {
        await createTeacher({ name, email, password });
        toast.success(t('createSuccess'));
        setIsOpen(false);
        // Clear fields
        setName('');
        setEmail('');
        setPassword('');
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : t('createError');
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-none bg-zinc-900 px-6 text-xs font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          <Plus className="mr-2 size-4" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card rounded-none border-2 border-zinc-200 p-6 sm:max-w-md dark:border-zinc-800">
        <DialogHeader className="space-y-1.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold tracking-wide text-zinc-400 uppercase">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-black tracking-wider text-zinc-500 uppercase"
            >
              {t('fullName')}
            </Label>
            <div className="relative">
              <User className="absolute top-3 left-3 size-4 text-zinc-400" />
              <Input
                id="name"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-none border-2 border-zinc-200 pl-10 focus-visible:border-purple-600 focus-visible:ring-purple-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-black tracking-wider text-zinc-500 uppercase"
            >
              {t('email')}
            </Label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 size-4 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@isen.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-2 border-zinc-200 pl-10 focus-visible:border-purple-600 focus-visible:ring-purple-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-black tracking-wider text-zinc-500 uppercase"
            >
              {t('temporaryPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 size-4 text-zinc-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-2 border-zinc-200 pl-10 focus-visible:border-purple-600 focus-visible:ring-purple-600"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-none border-2 border-zinc-200 font-bold"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-none bg-purple-600 px-5 text-xs font-black tracking-widest text-white uppercase hover:bg-purple-700 active:scale-[0.98]"
            >
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
