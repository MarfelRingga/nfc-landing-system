'use client';

import { ProfileMode } from '@/lib/types/profile';
import { getFieldsByMode } from '@/lib/profileFields';

interface ProfileTabContentProps {
  mode: ProfileMode;
  values: Record<string, string>;
  username: string;
  isPublic: boolean;
  allowMessages: boolean;
  onChange: (field: string, value: string) => void;
  onUsernameChange: (value: string) => void;
  onPublicToggle: () => void;
  onMessagesToggle: () => void;
}

export function ProfileTabContent({
  mode,
  values,
  username,
  isPublic,
  allowMessages,
  onChange,
  onUsernameChange,
  onPublicToggle,
  onMessagesToggle,
}: ProfileTabContentProps) {
  const fields = getFieldsByMode(mode);
  const dynamicFields = Object.entries(fields).filter(([key]) => key !== 'bio');
  const bioField = fields['bio'];

  return (
    <div className="w-full max-w-2xl p-5 space-y-4">
      {/* Visibility Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div>
          <label className="text-sm font-medium text-slate-800">Profile visibility</label>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPublic ? 'Your profile is visible to the public.' : 'Your profile is currently private.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={onPublicToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
            isPublic ? 'bg-slate-900' : 'bg-slate-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isPublic ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Username Field */}
      <div>
        <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
          Your Link
        </label>
        <div className="flex rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 overflow-hidden bg-slate-50">
          <span className="flex items-center px-3 bg-slate-100 text-slate-500 text-sm border-r border-slate-200 select-none">
            rifelo.id/u/
          </span>
          <input
            type="text"
            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            maxLength={30}
          />
        </div>
      </div>

      {/* Dynamic Fields */}
      {dynamicFields.map(([key, config]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
            {config.label}
            {!config.required && <span className="text-slate-400 text-xs font-normal ml-1">Optional</span>}
          </label>
          <input
            type={config.type === 'email' ? 'email' : config.type === 'tel' ? 'tel' : config.type === 'url' ? 'url' : 'text'}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
            placeholder={config.placeholder}
            value={values[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
            maxLength={config.maxLength}
          />
        </div>
      ))}

      {/* Bio Field */}
      {bioField && (
        <div>
          <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
            {bioField.label}
            {!bioField.required && <span className="text-slate-400 text-xs font-normal ml-1">Optional</span>}
          </label>
          <textarea
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
            rows={3}
            placeholder={bioField.placeholder}
            value={values['bio'] || ''}
            onChange={(e) => onChange('bio', e.target.value)}
            maxLength={bioField.maxLength}
          />
        </div>
      )}

      {/* Bottom Padding */}
      <div className="pt-2" />

      {/* Messages Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-slate-900 rounded border-slate-300"
          checked={allowMessages}
          onChange={onMessagesToggle}
        />
        <span className="text-sm text-slate-700 select-none">
          Allow people to send me messages
        </span>
      </label>
    </div>
  );
}
