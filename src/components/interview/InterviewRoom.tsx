"use client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import VideoPane from "./VideoPane"
import RightPaneTabs from "./RightPaneTabs"
import ChatWindow from "./ChatWindow"
import { useSocket } from "@/hooks/useSocket"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useInterviewStore } from "@/app/store/useInterviewStore"

interface InterviewRoomProps {
  roomCode: string
  sessionConfig: any
}

export default function InterviewRoom({ roomCode, sessionConfig }: InterviewRoomProps) {
  const token = useAuthStore((state) => state.token)
  const router = useRouter()
  const clearInterviewState = useInterviewStore((state) => state.clearState)

  useEffect(() => {
    if (!token) {
      router.replace("/")
    }
    clearInterviewState()
  }, [token, router, clearInterviewState])

  const { sendMessage, pushCodingQuestion, launchQuiz, endInterviewSession } = useSocket(roomCode)

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Left Panel - Video & Chat */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75} minSize={60}>
              <div className="h-full bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700">
                <VideoPane roomCode={roomCode} endInterviewSession={endInterviewSession} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-slate-200 dark:bg-slate-700" />
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                <ChatWindow sendMessage={sendMessage} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-200 dark:bg-slate-700" />

        {/* Right Panel - Tools */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full bg-white dark:bg-slate-800">
            <RightPaneTabs
              roomCode={roomCode}
              sessionConfig={sessionConfig}
              pushCodingQuestion={pushCodingQuestion}
              launchQuiz={launchQuiz}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
