'use client';

import React from 'react';

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-2">
          {/* Title line */}
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          {/* Subtitle line */}
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        {/* Preview Button placeholder */}
        <div className="h-10 w-36 bg-slate-200 rounded-lg shrink-0" />
      </div>

      <div className="space-y-6">
        {/* Card 1 Skeleton: Public Profile Visibility & URL */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="pb-6 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              {/* Visibility label */}
              <div className="h-5 w-40 bg-slate-200 rounded-md" />
              {/* Toggle switch placeholder */}
              <div className="h-6 w-11 bg-slate-200 rounded-full" />
            </div>

            <div className="space-y-2">
              {/* URL Label */}
              <div className="h-4 w-28 bg-slate-200 rounded-md" />
              {/* Prefix + input placeholder */}
              <div className="flex items-stretch h-12 rounded-xl overflow-hidden border border-slate-200/80">
                <div className="w-28 bg-slate-100 border-r border-slate-200/80" />
                <div className="flex-1 bg-white" />
              </div>
            </div>
            {/* Small description text block */}
            <div className="h-3.5 w-96 bg-slate-100 rounded-md" />
          </div>

          {/* Card 2 Skeleton: Profile Information */}
          <div className="space-y-6">
            <div className="h-6 w-44 bg-slate-200 rounded-lg" />
            
            {/* Inputs grid mimicking DynamicProfileForm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2 col-span-1">
                  <div className="h-4 w-24 bg-slate-200 rounded-md" />
                  <div className="h-11 bg-white border border-slate-200/80 rounded-xl" />
                </div>
              ))}
              
              {/* Bio Field (Textarea spanning full width) */}
              <div className="space-y-2 md:col-span-2">
                <div className="h-4 w-16 bg-slate-200 rounded-md" />
                <div className="h-32 bg-white border border-slate-200/80 rounded-xl flex flex-col justify-between overflow-hidden">
                  <div className="p-3">
                    <div className="h-3 w-3/4 bg-slate-100 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                  {/* Pull-tab handle mimicking the resizing controller */}
                  <div className="h-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                    <div className="w-12 h-1 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 Skeleton: Social & Custom Links */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-lg" />
              <div className="h-4 w-64 bg-slate-100 rounded-md" />
            </div>
            {/* Add new link button */}
            <div className="h-10 w-36 bg-slate-200 rounded-lg shrink-0" />
          </div>

          {/* Links list mock-ups */}
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border border-slate-200/80 rounded-2xl bg-white">
                {/* Grab handle placeholder */}
                <div className="w-4 h-12 bg-slate-100 rounded-md my-auto shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5Col">
                      <div className="h-3.5 w-16 bg-slate-200 rounded" />
                      <div className="h-10 bg-slate-50 border border-slate-200/60 rounded-xl" />
                    </div>
                    <div>
                      <div className="h-3.5 w-16 bg-slate-200 rounded" />
                      <div className="h-10 bg-slate-50 border border-slate-200/60 rounded-xl" />
                    </div>
                  </div>
                </div>
                {/* Controls (Visibility + Delete) placeholder */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                  <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4 Skeleton: Direct Anonymous Inbox */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-56 bg-slate-200 rounded-lg" />
              <div className="h-4 w-72 bg-slate-100 rounded-md" />
            </div>
            <div className="h-6 w-11 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
