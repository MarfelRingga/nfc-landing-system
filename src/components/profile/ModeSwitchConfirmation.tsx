'use client';

import React, { useEffect } from 'react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';
import { ProfileMode } from '@/lib/types/profile';
import { getFieldsByMode } from '@/lib/profileFields';
import { motion, AnimatePresence } from 'motion/react';

interface ModeSwitchConfirmationProps {
  fromMode: ProfileMode;
  toMode: ProfileMode;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const modeNames: Record<ProfileMode, string> = {
  casual: 'Casual',
  professional: 'Professional',
  creative: 'Creative'
};

export function ModeSwitchConfirmation({
  fromMode,
  toMode,
  onConfirm,
  onCancel,
  isOpen
}: ModeSwitchConfirmationProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const currentFields = Object.values(getFieldsByMode(fromMode)).map(f => f.label);
  const newFields = Object.values(getFieldsByMode(toMode)).map(f => f.label);

  const fieldsToRemove = currentFields.filter(f => !newFields.includes(f));
  const fieldsToAdd = newFields.filter(f => !currentFields.includes(f));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="presentation">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                Switch to {modeNames[toMode]}?
              </h2>
              <button
                onClick={onCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                You are about to switch your profile mode from <strong className="text-slate-900">{modeNames[fromMode]}</strong> to <strong className="text-slate-900">{modeNames[toMode]}</strong>. Here is what will happen:
              </p>

              {/* Data Reassurance */}
              <div className="flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Your data is safe</h4>
                  <p className="text-xs sm:text-sm text-blue-700/80 leading-relaxed">
                    No data will be deleted. Hidden fields from {modeNames[fromMode]} mode will be saved safely. You can switch back anytime.
                  </p>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Profile Layout Changes</h3>
                
                <div className="grid gap-3">
                  {fieldsToAdd.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Fields Added</div>
                      <div className="flex flex-wrap gap-2">
                        {fieldsToAdd.map(f => (
                          <span key={f} className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-medium">
                            + {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fieldsToRemove.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Fields Hidden</div>
                      <div className="flex flex-wrap gap-2">
                        {fieldsToRemove.map(f => (
                          <span key={f} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-200 text-slate-600 text-xs font-medium">
                            - {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Theme Updates</div>
                    <p className="text-sm text-slate-600">
                      Your profile's visual design will adapt to the recommended {modeNames[toMode]} presets. You can customize the theme after switching.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Switch to {modeNames[toMode]}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
