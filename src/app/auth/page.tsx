'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isLoginView ? 'Welcome Back!' : 'Create an Account'}</CardTitle>
          <CardDescription>
            {isLoginView ? 'Enter your credentials to access your dashboard.' : 'Fill out the form to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoginView ? <LoginForm /> : <RegisterForm onSwitch={() => setIsLoginView(true)} />}
          <div className="mt-4 text-center text-sm">
            {isLoginView ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLoginView(!isLoginView)} className="underline">
              {isLoginView ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}