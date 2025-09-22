'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to load files</h3>
      <p className="text-muted-foreground mb-4">
        There was an error loading the files. Please try again.
      </p>
      <Button onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
