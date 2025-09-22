'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoginFormFields } from './login-form-fields';
import { useAuth } from '@/hooks/use-auth';

type LoginFormProps = {
  onLoginSuccess?: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
    onLoginSuccess?.();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login to Stack AI
          </CardTitle>
        </CardHeader>

        <CardContent>
          <LoginFormFields
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            isLoading={isLoggingIn}
            error={loginError}
          />

          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>This will authenticate with Stack AI and access your Google Drive connections.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}