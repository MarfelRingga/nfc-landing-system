import React from 'react';
import { Check } from 'lucide-react';
import { ProfileMode } from '@/lib/types/profile';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface ModeSelectorProps {
  currentMode: ProfileMode;
  onModeSelect: (mode: ProfileMode) => void;
  readOnly?: boolean;
}

const MODES: { id: ProfileMode; name: string; description: string; emoji: string }[] = [
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed & friendly for friends and social networks.',
    emoji: '🎉',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal & structured for career and networking.',
    emoji: '💼',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Expressive focus on portfolios and artistry.',
    emoji: '🎨',
  },
];

export function ModeSelector({
  currentMode,
  onModeSelect,
  readOnly = false,
}: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {MODES.map((mode) => {
        const isSelected = currentMode === mode.id;

        return (
          <motion.div
            key={mode.id}
            whileHover={!readOnly ? { scale: 1.02 } : {}}
            whileTap={!readOnly ? { scale: 0.98 } : {}}
            onClick={() => !readOnly && onModeSelect(mode.id)}
            className={cn(
              "relative p-5 rounded-2xl border transition-all duration-300 md:p-6",
              !readOnly && "cursor-pointer",
              isSelected
                ? "border-slate-900 bg-slate-50 shadow-md ring-1 ring-slate-900"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            )}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-4 right-4 md:top-5 md:right-5 shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
              </div>
            )}

            <div className="flex flex-col h-full gap-3">
              <span className="text-3xl lg:text-4xl">{mode.emoji}</span>
              
              <div className="space-y-1 md:mt-2">
                <h3 className={cn(
                  "font-bold text-lg md:text-xl",
                  isSelected ? "text-slate-900" : "text-slate-700"
                )}>
                  {mode.name}
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
