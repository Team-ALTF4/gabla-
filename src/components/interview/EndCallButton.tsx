"use client"
import { useCall } from "@stream-io/video-react-sdk"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { PhoneOff, Loader2 } from "lucide-react"

// Updated to match your actual API endpoint
const endInterview = async (roomCode: string) => {
  const response = await fetch(`/api/interview/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomCode }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to end interview")
  }

  return response.json()
}

interface EndCallButtonProps {
  roomCode?: string;
  endInterviewSession: () => void;
}

export default function EndCallButton({ roomCode, endInterviewSession }: EndCallButtonProps) {
  const call = useCall()
  const router = useRouter()

  // Extract roomCode from call ID if not provided as prop
  const currentRoomCode = roomCode || call?.id

  const endCallMutation = useMutation({
    mutationFn: () => {
      if (!currentRoomCode) {
        throw new Error("Room code not available")
      }
      return endInterview(currentRoomCode)
    },
    onSuccess: (data) => {
        const reportApiUrl = data.reportUrl.replace('/reports/', '/api/reports/');
        toast.success("Interview ended & report generated.", { 
          action: {
            label: "View Report",
            onClick: () => window.open(reportApiUrl, '_blank')
          }
        });
        router.push('/dashboard');
    },
    onError: (error) => {
      toast.error("Failed to end interview session", {
        description: error.message,
      })
      // Still navigate away even if the API fails
      router.push("/dashboard")
    },
  })

  const handleEndCall = async () => {
    try {
      // Only call endInterviewSession if it exists
      if (typeof endInterviewSession === 'function') {
        endInterviewSession();
      }
      // End the Stream call first
      await call?.endCall()
      // Then call your API to update database and generate report
      endCallMutation.mutate()
    } catch (error) {
      console.error("Error ending call:", error)
      // Still try to call the API and navigate
      endCallMutation.mutate()
    }
  }

  return (
    <button
      onClick={handleEndCall}
      disabled={endCallMutation.isPending || !currentRoomCode}
      className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
      title="End interview"
    >
      {endCallMutation.isPending ? (
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      ) : (
        <PhoneOff className="w-5 h-5 text-white" />
      )}
    </button>
  )
}
