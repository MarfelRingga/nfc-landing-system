'use client';

import { motion } from 'motion/react';
import { User, Palette, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileTab } from '@/lib/types/profile';

interface ProfileTabNavProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  hasUnsavedChanges?: boolean;
}

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'links', label: 'Links', icon: LinkIcon },
];

export function ProfileTabNav({ activeTab, onTabChange, hasUnsavedChanges }: ProfileTabNavProps) {
  return (
    <div className="w-full border-b border-slate-200">
      <div className="flex items-center gap-8" role="tablist" aria-label="Profile navigation">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-1 py-3 text-sm transition-colors',
                isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline-block">{tab.label}</span>
              
              {isActive && hasUnsavedChanges && (
                <span 
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full" 
                  aria-label="Unsaved changes"
                />
              )}

              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-slate-900"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
