'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function FileListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          {/* Checkbox skeleton */}
          <Skeleton className="h-4 w-4 rounded" />

          {/* File icon skeleton */}
          <Skeleton className="h-6 w-6 rounded" />

          {/* File info skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>

          {/* Actions skeleton */}
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

export function FilePickerSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header skeleton */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="p-4 border-b">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* File list skeleton */}
      <div className="min-h-96">
        <FileListSkeleton />
      </div>

      {/* Footer skeleton */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}