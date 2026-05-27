export function PageSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-pulse w-full">
      {/* Skeleton Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-3 w-full max-w-md">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl shrink-0"></div>
      </div>

      {/* Skeleton Content Blocks */}
      <div className="space-y-6">
        {/* Main large block/table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-slate-100 rounded-md"></div>
              <div className="h-8 w-20 bg-slate-100 rounded-md"></div>
            </div>
          </div>
          
          {/* Skeleton list items */}
          <div className="space-y-4 pt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b border-slate-50 last:border-0">
                <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-slate-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
