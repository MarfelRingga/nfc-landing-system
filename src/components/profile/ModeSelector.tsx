import React from 'react';
import { ProfileMode } from '@/lib/types/profile';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface ModeSelectorProps {
  currentMode: ProfileMode;
  onModeSelect: (mode: ProfileMode) => void;
  readOnly?: boolean;
}

const MODES: { id: ProfileMode; name: string; emoji: string }[] = [
  { id: 'casual', name: 'Casual', emoji: '🎉' },
  { id: 'professional', name: 'Professional', emoji: '💼' },
  { id: 'creative', name: 'Creative', emoji: '🎨' },
];

export function ModeSelector({
  currentMode,
  onModeSelect,
  readOnly = false,
}: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {MODES.map((mode) => {
        const isSelected = currentMode === mode.id;

        return (
          <motion.button
            key={mode.id}
            whileHover={!readOnly ? { scale: 1.05 } : {}}
            whileTap={!readOnly ? { scale: 0.95 } : {}}
            onClick={() => !readOnly && onModeSelect(mode.id)}
            disabled={readOnly}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-200 font-semibold text-sm border-[1.5px]",
              isSelected
                ? "bg-slate-100/80 border-slate-400 text-slate-900 shadow-inner backdrop-blur-sm font-extrabold"
                : "bg-white/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              readOnly && "cursor-default opacity-80"
            )}
          >
            <span className="text-lg leading-none">{mode.emoji}</span>
            <span className="leading-none">{mode.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
