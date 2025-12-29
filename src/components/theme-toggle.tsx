'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      type='button'
      onClick={cycleTheme}
      aria-label={`Switch theme (current: ${theme})`}
      title={`Current theme: ${theme}. Click to cycle.`}
      className='flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08] text-black transition-colors hover:border-transparent hover:bg-black/[.06] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-white/[.06]'
    >
      {theme === 'dark' ? <Moon size={16} /> : theme === 'light' ? <Sun size={16} /> : <Monitor size={16} />}
    </button>
  );
}
