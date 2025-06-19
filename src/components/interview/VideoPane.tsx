"use client"

import { StreamTheme, StreamVideo, StreamVideoClient, StreamCall, type Call } from "@stream-io/video-react-sdk"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useQuery } from "@tanstack/react-query"
import { getStreamToken } from "@/lib/api"
import { useEffect, useState, useRef } from "react"
import MeetingSetup from "./MeetingSetup"
import MeetingRoom from "./MeetingRoom"
import { Loader2, Wifi } from "lucide-react"

interface VideoPaneProps {
  roomCode: string;
  endInterviewSession: () => void;
}

export default function VideoPane({ roomCode, endInterviewSession }: VideoPaneProps) {
  const user = useAuthStore((state) => state.user)
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  const clientRef = useRef<StreamVideoClient | null>(null)
  const callRef = useRef<Call | null>(null)

  const { data: tokenData, isLoading: isTokenLoading } = useQuery({
    queryKey: ["stream-token", user?.id, roomCode],
    queryFn: () => getStreamToken(user!.id, roomCode),
    enabled: !!user,
  })

  const token = tokenData?.token
  const userId = user?.id

  useEffect(() => {
    if (!userId || !token) return
    if (clientRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
    if (!apiKey) throw new Error("Stream API key is missing!")

    const client = new StreamVideoClient({
      apiKey,
      user: { id: userId, name: user.name || user.email },
      token: token,
    })
    const call = client.call("default", roomCode)

    clientRef.current = client
    callRef.current = call
  }, [userId, token, roomCode])

  // Show loading while preparing
  if (isTokenLoading || !clientRef.current || !callRef.current) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 text-slate-600 dark:text-slate-400">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Wifi className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Preparing Session</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connecting to interview room...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <StreamVideo client={clientRef.current}>
        <StreamCall call={callRef.current}>
          <StreamTheme className="h-full w-full">
            {isSetupComplete ? (
              <MeetingRoom roomCode={roomCode} endInterviewSession={endInterviewSession}  />
            ) : (
              <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
            )}
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  )
}
