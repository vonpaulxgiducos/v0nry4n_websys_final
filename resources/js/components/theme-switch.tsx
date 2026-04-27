import { Moon, Sun } from 'lucide-react';

import { useAppearance } from '@/hooks/use-appearance';

export default function ThemeSwitch() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className={`relative inline-flex h-7 w-14 items-center rounded-full shadow-lg transition-all duration-300 ${
                isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
            }`}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Left section - Sun icon (shown in dark mode) */}
            <div className="absolute left-2 flex items-center justify-center">
                <Sun className={`h-3.5 w-3.5 transition-all duration-300 ${
                    isDark ? 'text-slate-500 opacity-60' : 'text-slate-400 opacity-0'
                }`} />
            </div>

            {/* Right section - Moon icon (shown in light mode) */}
            <div className="absolute right-2 flex items-center justify-center">
                <Moon className={`h-3.5 w-3.5 transition-all duration-300 ${
                    isDark ? 'text-slate-400 opacity-0' : 'text-slate-400 opacity-60'
                }`} />
            </div>

            {/* Animated sliding ball - Yellow in light mode, gray in dark mode */}
            <span
                className={`absolute top-0.5 h-6 w-6 rounded-full shadow-md transition-all duration-300 ${
                    isDark
                        ? 'translate-x-7 bg-slate-600'
                        : 'translate-x-0.5 bg-yellow-400'
                }`}
            />
        </button>
    );
}