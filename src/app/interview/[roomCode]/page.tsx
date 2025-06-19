// src/app/interview/[roomCode]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { verifyRoom } from '@/lib/api';
import InterviewRoom from '@/components/interview/InterviewRoom';
import { useAuthStore } from '@/app/store/useAuthStore';
import { Button } from '@/components/ui/button';

export default function InterviewPage() {
    const params = useParams();
    const router = useRouter();
    // --- THE FIX: Get the token AND the hydration status from the store ---
    const { token, isHydrated } = useAuthStore();

    const roomCode = params ? (Array.isArray(params.roomCode) ? params.roomCode[0] : params.roomCode) : null;
    
    // This effect now correctly waits for hydration before checking the token
    useEffect(() => {
        if (isHydrated && !token) {
            router.replace('/');
        }
    }, [token, isHydrated, router]);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['interview-session', roomCode],
        queryFn: () => verifyRoom(roomCode!),
        // The query will only run if we have a roomCode AND auth state is hydrated.
        enabled: !!(roomCode && isHydrated), 
        retry: false,
    });

    // --- THE FIX: Show a generic loading state until the store is ready ---
    // This prevents any logic from running prematurely.
    if (!isHydrated || isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Loading session...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen w-screen items-center justify-center text-center">
                <div>
                    <h1 className="text-2xl font-bold text-destructive">Session Not Found</h1>
                    <p className="text-muted-foreground">
                        {/* @ts-ignore */}
                        {error?.message || "The room code is invalid or the session has expired."}
                    </p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (data && data.isValid) {
        return <InterviewRoom roomCode={roomCode!} sessionConfig={data.sessionConfig} />;
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <p>An unexpected error occurred. Please try again.</p>
        </div>
    );
}