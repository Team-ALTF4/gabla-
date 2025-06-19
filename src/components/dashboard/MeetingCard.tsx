'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { FileText, Calendar } from "lucide-react";
import { useState, useEffect } from 'react';

// This component no longer needs the `useRouter` hook since we are opening the report in a new tab.

interface MeetingCardProps {
  title: string;
  date: string; // We will receive the raw ISO date string
  reportUrl?: string | null;
}

export default function MeetingCard({ title, date, reportUrl }: MeetingCardProps) {
  // State to hold the client-side formatted date to prevent hydration errors.
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  // --- THIS IS THE FIX FOR THE REPORT URL ---
  // We construct the correct, callable API endpoint from the file path stored in the database.
  // This is a derived constant, so it doesn't need to be in state.
  const apiReportUrl = reportUrl ? reportUrl.replace('/reports/', '/api/reports/') : null;

  useEffect(() => {
    // This effect runs only on the client, so it can safely use browser-specific APIs.
    setFormattedDate(new Date(date).toLocaleString());
  }, [date]); // It re-runs only if the date prop changes.
  
  return (
    <Card className="flex flex-col justify-between bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="truncate">{title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {/* Render a placeholder on the server, then the real date on the client */}
                    {formattedDate ? formattedDate : '...'}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button
          // The button now opens the API URL in a new browser tab.
          onClick={() => window.open(apiReportUrl!, '_blank')}
          disabled={!apiReportUrl}
          className="w-full"
        >
          {apiReportUrl ? 'View Process Report' : 'Report Not Available'}
        </Button>
      </CardFooter>
    </Card>
  );
}