// src/components/dashboard/CallList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getInterviewHistory } from '@/lib/api';
import Loader from './Loader';
import MeetingCard from './MeetingCard';
import { toast } from 'sonner';
import { useEffect } from 'react'; 

interface InterviewSession {
  id: string;
  roomCode: string;
  endedAt: string; 
  reportFilePath: string | null;
}

export default function CallList() {
  const { data: pastSessions, isLoading, isError, error } = useQuery<InterviewSession[], Error>({
    queryKey: ['interview-history'],
    queryFn: getInterviewHistory,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load past interviews.", {
        description: error?.message,
      });
    }
  }, [isError, error]);


  if (isLoading) return <Loader />;
  if (isError) return <p className="text-destructive">Error loading sessions. Please try refreshing.</p>;
  
  const noCallsMessage = 'No Previous Interviews';

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {pastSessions && pastSessions.length > 0 ? (
        pastSessions.map((session) => (
          <MeetingCard
            key={session.id}
            title={`Interview: ${session.roomCode}`}
            date={new Date(session.endedAt).toLocaleString()}
            reportUrl={session.reportFilePath}
          />
        ))
      ) : (
        <h1 className="text-xl font-bold">{noCallsMessage}</h1>
      )}
    </div>
  );
}