// src/app/dashboard/page.tsx
'use client';

import { useAuthStore } from '@/app/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CreateInterviewModal from '@/components/dashboard/CreateInterviewModal';
import { Button } from '@/components/ui/button';
import CallList from '@/components/dashboard/CallList'; // <-- IMPORT THE NEW COMPONENT

export default function DashboardPage() {
  const { user, token, logout, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration before checking token
    if (isHydrated && !token) {
      router.replace('/');
    }
  }, [isHydrated, token, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isHydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name || user.email}!</h1>
          <p className="text-muted-foreground">Manage your interview sessions from here.</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </header>

      <main className="space-y-8">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Start a new session</h2>
          <CreateInterviewModal />
        </div>
        
        {/* --- THIS IS THE REPLACEMENT --- */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Interviews</h2>
          <div className="p-6 border rounded-lg">
            <CallList />
          </div>
        </div>
      </main>
    </div>
  );
}