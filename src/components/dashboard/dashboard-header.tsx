'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

type DashboardHeaderProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function DashboardHeader({ onLogout, isLoggingOut }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">Stack AI Google Drive File Picker</h1>
        <p className="text-muted-foreground">
          Browse, manage, and index your Google Drive files for knowledge base creation
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="ml-4"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </>
        )}
      </Button>
    </div>
  );
}