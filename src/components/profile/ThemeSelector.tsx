import React, { useMemo } from 'react';
import { ProfileMode } from '@/lib/types/profile';
import { getThemesByMode, getTheme } from '@/lib/themePresets';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface ThemeSelectorProps {
  currentMode: ProfileMode;
  currentTheme: string;
  onThemeSelect: (theme: string) => void;
}

const getPreviewColors = (themeId: string, colors: any) => {
  switch (themeId) {
    case 'vibrant':
      return {
        c1: 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)', // real pastel card gradient
        c2: '#7c3aed', // vibrant Purple accent
      };
    case 'playful':
      return {
        c1: '#fffbeb', // cream background
        c2: '#f59e0b', // playful Amber
      };
    case 'corporate':
      return {
        c1: '#f8fafc', // corporate slate background
        c2: '#1d4ed8', // professional Blue accent
      };
    case 'minimal':
      return {
        c1: '#f8fafc', // minimal slate theme background
        c2: '#0f172a', // minimal deep slate/black focus
      };
    case 'gradient':
      return {
        c1: 'linear-gradient(to bottom right, #0f172a, #312e81)', // real dark cosmic background gradient
        c2: '#38bdf8', // vivid neon Sky Blue accent
      };
    default:
      return {
        c1: colors.background,
        c2: colors.primary,
      };
  }
};

export function ThemeSelector({
  currentMode,
  currentTheme,
  onThemeSelect,
}: ThemeSelectorProps) {
  const availableThemes = useMemo(() => getThemesByMode(currentMode), [currentMode]);
  
  // Get active theme config, fallback to first available if not found
  const activeThemeConfig = useMemo(() => {
    let theme = getTheme(currentTheme);
    if (!theme && availableThemes.length > 0) {
      theme = availableThemes[0];
    }
    return theme;
  }, [currentTheme, availableThemes]);

  if (!activeThemeConfig) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2.5 justify-start">
        {availableThemes.map((theme) => {
          const isSelected = theme.id === currentTheme;
          const preview = getPreviewColors(theme.id, theme.colors);
          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onThemeSelect(theme.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-200 font-semibold text-sm border-[1.5px]",
                isSelected
                  ? "bg-slate-100/80 border-slate-400 text-slate-900 shadow-inner backdrop-blur-sm font-extrabold"
                  : "bg-white/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex shrink-0 items-center">
                <div 
                  className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10 z-10"
                  style={{ background: preview.c1 }}
                />
                <div 
                  className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10 -ml-1.5"
                  style={{ background: preview.c2 }}
                />
              </div>
              <span className="leading-none pt-0.5">{theme.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
