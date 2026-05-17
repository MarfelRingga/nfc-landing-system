import React, { useState, useEffect } from 'react';
import { 
  User, Smile, GraduationCap, MessageCircle, Info, 
  Briefcase, Building, Mail, Phone, FileText, 
  Palette, Link as LinkIcon, Feather, AlertCircle
} from 'lucide-react';
import { ProfileMode } from '@/lib/types/profile';
import { getFieldsByMode } from '@/lib/profileFields';
import { cn } from '@/lib/utils';

// Map string icon names from config to actual Lucide components
const IconMap: Record<string, React.ElementType> = {
  User,
  Smile,
  GraduationCap,
  MessageCircle,
  Info,
  Briefcase,
  Building,
  Mail,
  Phone,
  FileText,
  Palette,
  Link: LinkIcon,
  Feather
};

export interface DynamicProfileFormProps {
  mode: ProfileMode;
  initialValues?: Record<string, string>;
  onChange?: (field: string, value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export function DynamicProfileForm({
  mode,
  initialValues = {},
  onChange,
  onSubmit,
  isLoading = false
}: DynamicProfileFormProps) {
  const fields = getFieldsByMode(mode);
  
  // Local state for the form values
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  // Local state for tracking touched fields for validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sync initialValues if they change deeply (optional, but good for resetting)
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (key: string, value: string) => {
    // Basic auto-formatting hints (like phone numbers) could be applied here
    // For simplicity, we just update the value
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    if (onChange) {
      onChange(key, value);
    }
  };

  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {Object.entries(fields).map(([key, config]) => {
          const value = values[key] || '';
          const isTouched = touched[key];
          const isError = isTouched && config.required && !value.trim();
          const IconComponent = config.icon ? IconMap[config.icon] : null;
          
          // Determine if field should span full width
          const isTextarea = config.type === 'textarea';
          const spanClass = isTextarea ? "md:col-span-2" : "col-span-1";

          return (
            <div key={key} className={cn("flex flex-col space-y-1.5", spanClass)}>
              <div className="flex items-center justify-between">
                <label 
                  htmlFor={`field-${key}`}
                  className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  {config.label}
                  {config.required && <span className="text-red-500">*</span>}
                </label>
                
                {/* Character counter for fields with maxLength */}
                {config.maxLength && (
                  <span className={cn(
                    "text-xs font-medium",
                    value.length >= config.maxLength ? "text-amber-500" : "text-slate-400"
                  )}>
                    {value.length}/{config.maxLength}
                  </span>
                )}
              </div>

              <div className="relative">
                {IconComponent && (
                  <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                    <IconComponent className="w-5 h-5" />
                  </div>
                )}
                
                {isTextarea ? (
                  <textarea
                    id={`field-${key}`}
                    name={key}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onBlur={() => handleBlur(key)}
                    placeholder={config.placeholder}
                    maxLength={config.maxLength}
                    required={config.required}
                    disabled={isLoading}
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 resize-y min-h-[120px]",
                      IconComponent && "pl-10",
                      isError 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-slate-200 focus:border-slate-800 focus:ring-slate-800/10 hover:border-slate-300"
                    )}
                    aria-invalid={isError ? "true" : "false"}
                    aria-describedby={isError ? `error-${key}` : undefined}
                  />
                ) : (
                  <input
                    id={`field-${key}`}
                    type={config.type}
                    name={key}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onBlur={() => handleBlur(key)}
                    placeholder={config.placeholder}
                    maxLength={config.maxLength}
                    required={config.required}
                    disabled={isLoading}
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
                      IconComponent && "pl-10",
                      isError 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-slate-200 focus:border-slate-800 focus:ring-slate-800/10 hover:border-slate-300"
                    )}
                    aria-invalid={isError ? "true" : "false"}
                    aria-describedby={isError ? `error-${key}` : undefined}
                  />
                )}
              </div>

              {/* Error Message */}
              {isError && (
                <div className="flex items-center text-red-500 text-xs mt-1 font-medium gap-1" id={`error-${key}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>This field is required</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onSubmit && (
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all",
              isLoading && "opacity-70 cursor-wait"
            )}
          >
            {isLoading ? 'Saving...' : 'Save Profile Details'}
          </button>
        </div>
      )}
    </form>
  );
}
