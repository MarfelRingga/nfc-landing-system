'use client';

import { useState, useEffect } from 'react';
import { CustomColors, POPULAR_COLORS } from '@/lib/types/profile';
import { cn } from '@/lib/utils';

interface ColorCustomizerProps {
  colors: CustomColors;
  onChange: (colors: CustomColors) => void;
}

function hexToRgb(h: string) {
  let r = 0,
    g = 0,
    b = 0;
  if (h.length === 4) {
    r = parseInt(h[1] + h[1], 16);
    g = parseInt(h[2] + h[2], 16);
    b = parseInt(h[3] + h[3], 16);
  } else if (h.length === 7) {
    r = parseInt(h.slice(1, 3), 16);
    g = parseInt(h.slice(3, 5), 16);
    b = parseInt(h.slice(5, 7), 16);
  } else return null;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function expandHex(hex: string) {
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

const COLOR_MAP: Record<string, string> = {
  '#a855f7': 'Purple',
  '#7c3aed': 'Purple',
  '#6d28d9': 'Purple',
  '#ec4899': 'Pink',
  '#db2777': 'Pink',
  '#f43f5e': 'Rose',
  '#3b82f6': 'Blue',
  '#2563eb': 'Blue',
  '#0ea5e9': 'Cyan',
  '#06b6d4': 'Cyan',
  '#22c55e': 'Green',
  '#10b981': 'Green',
  '#059669': 'Green',
  '#84cc16': 'Lime',
  '#f59e0b': 'Amber',
  '#d97706': 'Amber',
  '#ef4444': 'Red',
  '#dc2626': 'Red',
  '#14b8a6': 'Teal',
  '#0d9488': 'Teal',
  '#6366f1': 'Indigo',
  '#4f46e5': 'Indigo',
  '#f97316': 'Orange',
  '#64748b': 'Slate',
  '#f4f3ee': 'Off-white',
  '#ffffff': 'White',
  '#000000': 'Black',
};

function getColorName(hex: string): string {
  const norm = expandHex(hex).toLowerCase();
  if (COLOR_MAP[norm]) return COLOR_MAP[norm];

  const rgb = hexToRgb(norm);
  if (!rgb) return 'Custom';

  let minDistance = Infinity;
  let closest = 'Custom';

  for (const [key, name] of Object.entries(COLOR_MAP)) {
    const cRgb = hexToRgb(key)!;
    const dist =
      Math.pow(rgb.r - cRgb.r, 2) +
      Math.pow(rgb.g - cRgb.g, 2) +
      Math.pow(rgb.b - cRgb.b, 2);
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
    }
  }
  return minDistance < 5000 ? closest : 'Custom';
}

function isValidHex(hex: string) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

interface ColorPickerRowProps {
  label: string;
  colorKey: keyof CustomColors;
  colorValue: string;
  onChangeColor: (key: keyof CustomColors, value: string) => void;
}

function ColorPickerRow({
  label,
  colorKey,
  colorValue,
  onChangeColor,
}: ColorPickerRowProps) {
  const [inputValue, setInputValue] = useState(colorValue);

  // Sync internal state when parent props update (e.g. preset clicked)
  useEffect(() => {
    setInputValue(colorValue);
  }, [colorValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#') && val.length > 0) {
      val = '#' + val;
    }
    setInputValue(val);

    if (isValidHex(val)) {
      onChangeColor(colorKey, expandHex(val).toLowerCase());
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChangeColor(colorKey, val);
  };

  const id = `color-${colorKey}`;
  const colorPickerValue = isValidHex(colorValue)
    ? expandHex(colorValue).toLowerCase()
    : '#000000';

  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-500 uppercase tracking-wide"
      >
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        {/* Picker and Info */}
        <div className="flex items-center gap-4">
          <input
            id={id}
            type="color"
            value={colorPickerValue}
            onChange={handlePickerChange}
            className="w-14 h-14 rounded-xl cursor-pointer border-0 p-1 bg-transparent shrink-0"
          />

          <div className="flex flex-col gap-1 w-28">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full px-2 py-1 text-sm font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none"
              maxLength={7}
            />
            <span className="text-xs text-slate-500 px-1 truncate">
              {getColorName(isValidHex(inputValue) ? inputValue : colorValue)}
            </span>
          </div>
        </div>

        {/* Popular dots grid */}
        <div className="flex flex-wrap gap-2 pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-slate-200">
          {POPULAR_COLORS.map((hex) => {
            const isSelected = hex.toLowerCase() === colorValue.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                title={getColorName(hex)}
                onClick={() => {
                  setInputValue(hex);
                  onChangeColor(colorKey, hex);
                }}
                className={cn(
                  'w-7 h-7 rounded-full cursor-pointer border-2 transition-colors',
                  isSelected
                    ? 'border-slate-900 shadow-sm scale-110'
                    : 'border-transparent hover:border-slate-400'
                )}
                style={{ backgroundColor: hex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ColorCustomizer({ colors, onChange }: ColorCustomizerProps) {
  const handleChangeColor = (key: keyof CustomColors, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  return (
    <div className="space-y-6">
      <ColorPickerRow
        label="Primary Color"
        colorKey="primary"
        colorValue={colors.primary}
        onChangeColor={handleChangeColor}
      />
      <ColorPickerRow
        label="Secondary Color"
        colorKey="secondary"
        colorValue={colors.secondary}
        onChangeColor={handleChangeColor}
      />
      <ColorPickerRow
        label="Accent Color"
        colorKey="accent"
        colorValue={colors.accent}
        onChangeColor={handleChangeColor}
      />
    </div>
  );
}
