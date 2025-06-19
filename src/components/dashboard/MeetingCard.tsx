"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { FileText, Calendar } from "lucide-react";
import { useState, useEffect } from 'react';

interface MeetingCardProps {
  title: string;
  date: string;
  reportUrl?: string | null;
}

export default function MeetingCard({ title, date, reportUrl }: MeetingCardProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(new Date(date).toLocaleString());
  }, [date]);

  return (
    <Card className="flex flex-col justify-between bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="truncate">{title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formattedDate ? formattedDate : '...'}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={() => window.open(reportUrl!, '_blank')}
          disabled={!reportUrl}
          className="w-full"
        >
          {reportUrl ? 'View Process Report' : 'Report Not Available'}
        </Button>
      </CardFooter>
    </Card>
  );
}
