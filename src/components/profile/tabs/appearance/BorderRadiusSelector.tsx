'use client';

import { BorderRadius } from '@/lib/types/profile';
import { cn } from '@/lib/utils';

interface BorderRadiusSelectorProps {
  selectedRadius: BorderRadius;
  onRadiusSelect: (radius: BorderRadius) => void;
}

const RADIUS_OPTIONS: { id: BorderRadius; label: string; pxStyle: string; desc: string }[] = [
  { id: 'subtle', label: 'Subtle', pxStyle: '8px', desc: 'Clean & sharp' },
  { id: 'rounded', label: 'Rounded', pxStyle: '12px', desc: 'Balanced' },
  { id: 'pill', label: 'Pill', pxStyle: '24px', desc: 'Soft & playful' },
];

export function BorderRadiusSelector({ selectedRadius, onRadiusSelect }: BorderRadiusSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
        Link Style
      </label>
      <div className="flex flex-wrap gap-3">
        {RADIUS_OPTIONS.map((opt) => {
          const isSelected = selectedRadius === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onRadiusSelect(opt.id)}
              className={cn(
                'flex flex-col items-center justify-between p-3 rounded-xl border transition-all w-28 h-24',
                isSelected
                  ? 'ring-2 ring-slate-900 border-transparent bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
            >
              <div className="flex-1 flex items-center justify-center w-full mt-1">
                <div 
                  className="bg-slate-900 text-white flex items-center justify-center text-xs font-medium"
                  style={{ width: '60px', height: '28px', borderRadius: opt.pxStyle }}
                >
                  Link
                </div>
              </div>
              <div className="text-center mt-2 w-full">
                <div className="text-xs font-medium text-slate-900">{opt.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
