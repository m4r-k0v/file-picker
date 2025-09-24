'use client';

import { LoginForm } from "@/components/auth/login-form";
import { useAuth, useAuthRedirect } from "@/hooks/use-nextauth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  useAuthRedirect('dashboard');

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );

  }

  return <LoginForm />;
}