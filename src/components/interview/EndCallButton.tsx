"use client"
import { useCall } from "@stream-io/video-react-sdk"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { PhoneOff, Loader2 } from "lucide-react"
import { useAuthStore } from "@/app/store/useAuthStore"

const endInterview = async (roomCode: string, token: string | null) => {
  const response = await fetch(`/api/interview/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
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
  endInterviewSession?: () => void;
}

export default function EndCallButton({ endInterviewSession }: EndCallButtonProps) {
  const call = useCall()
  const router = useRouter()
  const token = useAuthStore((state) => state.token)

  const currentRoomCode = call?.id

  const endCallMutation = useMutation({
    mutationFn: () => {
      if (!currentRoomCode) throw new Error("Room code not available")
      return endInterview(currentRoomCode, token)
    },
    onSuccess: (data) => {
      toast.success("Interview ended & report generated.", { 
        action: {
          label: "View Report",
          onClick: () => window.open(data.reportUrl, '_blank')
        }
      });
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error("Failed to end interview session", {
        description: error.message,
      })
      router.push("/dashboard")
    },
  })

  const handleEndCall = async () => {
    try {
      endInterviewSession?.();
      await call?.endCall()
      endCallMutation.mutate()
    } catch (error) {
      console.error("Error ending call:", error)
      endCallMutation.mutate()
    }
  }

  return (
    <button
      onClick={handleEndCall}
      disabled={endCallMutation.isPending || !currentRoomCode}
      className="flex items-center justify-center w-auto px-4 h-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-full transition-all duration-200 font-medium shadow-lg"
      title="End interview for all"
    >
      {endCallMutation.isPending ? (
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      ) : (
        <>
            <PhoneOff className="w-5 h-5 text-white mr-2" />
            <span>End Call</span>
        </>
      )}
    </button>
  )
}
