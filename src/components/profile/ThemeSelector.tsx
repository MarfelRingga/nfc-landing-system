import React, { useMemo } from 'react';
import { CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { ProfileMode } from '@/lib/types/profile';
import { getThemesByMode, getTheme } from '@/lib/themePresets';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeSelectorProps {
  currentMode: ProfileMode;
  currentTheme: string;
  onThemeSelect: (theme: string) => void;
  profilePreview?: {
    name: string;
    status: string;
    links: { title: string; url: string }[];
  };
}

export function ThemeSelector({
  currentMode,
  currentTheme,
  onThemeSelect,
  profilePreview = {
    name: 'Sarah Williams',
    status: 'Graphic Designer & Illustrator',
    links: [
      { title: 'Portfolio', url: '#' },
      { title: 'Instagram', url: '#' }
    ]
  }
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
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Left: Theme Selection */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
          {availableThemes.map((theme) => {
            const isSelected = theme.id === currentTheme;
            return (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onThemeSelect(theme.id)}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all shrink-0 snap-start w-[240px] lg:w-auto",
                  isSelected
                    ? "border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {/* Color Swatches */}
                <div className="flex gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full shadow-inner border border-black/5"
                    style={{ background: theme.colors.background }}
                  />
                  <div 
                    className="w-8 h-8 rounded-full shadow-inner border border-black/5"
                    style={{ background: theme.colors.primary }}
                  />
                  <div 
                    className="w-8 h-8 rounded-full shadow-inner border border-black/5"
                    style={{ background: theme.colors.accent }}
                  />
                </div>

                <h4 className="font-bold text-slate-900 mb-1">{theme.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 fill-slate-900" style={{ color: "white" }} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 hidden lg:block">Live Preview</h3>
        <div className="relative flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-8 flex items-center justify-center min-h-[400px] overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeThemeConfig.name} // re-render on theme change
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[320px] shadow-xl overflow-hidden border border-black/5 flex flex-col"
              style={{
                background: activeThemeConfig.colors.background,
                color: activeThemeConfig.colors.text,
                fontFamily: activeThemeConfig.fonts.body,
                borderRadius: activeThemeConfig.borderRadius,
              }}
            >
              {/* Header area */}
              <div 
                className="relative h-24 sm:h-32 w-full shrink-0"
                style={{ background: activeThemeConfig.colors.cardBg }}
              />
              
              <div className="px-6 pb-8 pt-0 flex flex-col items-center relative z-10 flex-1">
                {/* Avatar Placeholder */}
                <div 
                  className="w-20 h-20 rounded-full border-4 shadow-sm -mt-10 mb-4 flex items-center justify-center text-xl font-bold"
                  style={{ 
                    borderColor: activeThemeConfig.colors.background,
                    backgroundColor: activeThemeConfig.colors.primary,
                    color: activeThemeConfig.colors.secondary
                  }}
                >
                  {profilePreview.name.charAt(0)}
                </div>

                <h2 
                  className="text-xl sm:text-2xl font-bold text-center mb-1 w-full truncate"
                  style={{ fontFamily: activeThemeConfig.fonts.heading }}
                >
                  {profilePreview.name}
                </h2>
                
                <p 
                  className="text-sm text-center mb-6 opacity-80 w-full truncate"
                >
                  {profilePreview.status}
                </p>

                {/* Links */}
                <div className="w-full space-y-3">
                  {profilePreview.links.map((link, idx) => (
                    <motion.a
                      key={idx}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between w-full p-4 rounded-xl shadow-sm border transition-all"
                      style={{
                        backgroundColor: activeThemeConfig.colors.secondary,
                        borderColor: 'transparent',
                        color: activeThemeConfig.colors.text,
                        borderRadius: activeThemeConfig.borderRadius,
                      }}
                    >
                      <span className="font-semibold text-sm truncate">{link.title}</span>
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center opacity-80"
                        style={{ backgroundColor: activeThemeConfig.colors.accent, color: '#fff' }}
                      >
                        <LinkIcon className="w-3 h-3" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
