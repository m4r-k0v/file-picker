'use client';

import { FilePicker } from "@/components/file-picker/file-picker";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth, useAuthRedirect } from "@/hooks/use-nextauth";

export default function Dashboard() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  useAuthRedirect('login');

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto py-8 px-4">
        <DashboardHeader 
          onLogout={handleLogout}
          isLoggingOut={isLoading}
        />

      <FilePicker />
      </div>
    </div>
  );
}