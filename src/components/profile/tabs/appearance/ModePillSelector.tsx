'use client';

import { ProfileMode } from '@/lib/types/profile';
import { cn } from '@/lib/utils';

interface ModePillSelectorProps {
  currentMode: ProfileMode;
  onModeSelect: (mode: ProfileMode) => void;
}

const MODES: { id: ProfileMode; label: string; icon: string }[] = [
  { id: 'casual', label: 'Casual', icon: '🎉' },
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
];

export function ModePillSelector({ currentMode, onModeSelect }: ModePillSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        Mode
      </label>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeSelect(m.id)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-full transition-colors font-medium border flex items-center gap-1.5',
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
