'use client';

import { ProfileMode, CustomColors } from '@/lib/types/profile';
import { getThemesByMode } from '@/lib/themePresets';
import { cn } from '@/lib/utils';

interface PresetSelectorProps {
  currentMode: ProfileMode;
  selectedPreset: string | null;
  onPresetSelect: (preset: string) => void;
  onPresetApplyColors: (colors: CustomColors) => void;
}

export function PresetSelector({
  currentMode,
  selectedPreset,
  onPresetSelect,
  onPresetApplyColors
}: PresetSelectorProps) {
  const compatibleThemes = getThemesByMode(currentMode);

  if (compatibleThemes.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        Theme Preset
      </label>
      <div className="flex flex-wrap gap-2">
        {compatibleThemes.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                onPresetSelect(preset.id);
                onPresetApplyColors({
                  primary: preset.colors.primary,
                  secondary: preset.colors.secondary,
                  accent: preset.colors.accent,
                });
              }}
              className={cn(
                'w-20 p-2 rounded-lg border transition-all flex flex-col items-center gap-2',
                isSelected
                  ? 'ring-2 ring-slate-900 ring-offset-1 border-transparent'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
            >
              <div className="flex gap-1">
                <span 
                  className="w-4 h-4 rounded-full border border-black/10" 
                  style={{ backgroundColor: preset.colors.primary }} 
                  title="Primary"
                />
                <span 
                  className="w-4 h-4 rounded-full border border-black/10" 
                  style={{ backgroundColor: preset.colors.secondary }} 
                  title="Secondary"
                />
                <span 
                  className="w-4 h-4 rounded-full border border-black/10" 
                  style={{ backgroundColor: preset.colors.accent }} 
                  title="Accent"
                />
              </div>
              <span className="text-xs font-medium text-slate-700">{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
