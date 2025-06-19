// src/components/dashboard/Loader.tsx
import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex-center h-full w-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}