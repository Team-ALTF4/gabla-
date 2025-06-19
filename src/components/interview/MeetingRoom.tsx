"use client"

import { useMemo, useState, useEffect } from "react"
import {
  PaginatedGridLayout,
  useCallStateHooks,
  useCall,
  ParticipantView,
  SpeakerLayout,
} from "@stream-io/video-react-sdk"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Mic, MicOff, Video, VideoOff, Monitor, Grid3X3, Layout, Settings, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import EndCallButton from "./EndCallButton"

// Hide default Stream.io screen sharing banner
const hideStreamBanner = `
  .str-video__screen-share-overlay {
    display: none !important;
  }
  .str-video__screen-share-banner {
    display: none !important;
  }
  .str-video__notification {
    display: none !important;
  }
`

interface MeetingRoomProps {
  roomCode?: string;
  endInterviewSession?: () => void;
}

type LayoutType = "grid" | "speaker" | "auto"

export default function MeetingRoom({ roomCode, endInterviewSession = () => {} }: MeetingRoomProps) {
  const call = useCall()
  const { useCameraState, useMicrophoneState, useParticipants } = useCallStateHooks()
  const { isMute: isCameraMuted } = useCameraState()
  const { isMute: isMicMuted } = useMicrophoneState()
  const participants = useParticipants()

  const [layoutType, setLayoutType] = useState<LayoutType>("auto")
  const [showScreenShareBadge, setShowScreenShareBadge] = useState(false)

  // Check if anyone is screen sharing
  const screenSharingParticipant = participants.find((p) => p.screenShareStream)
  const isScreenSharing = !!screenSharingParticipant

  // Auto-hide screen sharing badge after 2 seconds
  useEffect(() => {
    if (isScreenSharing) {
      setShowScreenShareBadge(true)
      const timer = setTimeout(() => {
        setShowScreenShareBadge(false)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setShowScreenShareBadge(false)
    }
  }, [isScreenSharing])

  // Memoize layout to prevent re-renders
  const videoLayout = useMemo(() => {
    if (!participants.length) return null

    // GRID VIEW - Custom grid that includes screen share
    if (layoutType === "grid") {
      if (isScreenSharing && screenSharingParticipant) {
        // Create a custom grid with screen share + participants
        const allItems = [
          { type: "screen", participant: screenSharingParticipant },
          ...participants.map((p) => ({ type: "video", participant: p })),
        ]

        const gridCols = allItems.length <= 2 ? "grid-cols-2" : allItems.length <= 4 ? "grid-cols-2" : "grid-cols-3"

        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className={`w-full max-w-6xl grid ${gridCols} gap-4 max-h-full`}>
              {allItems.map((item, index) => (
                <div
                  key={`${item.type}-${item.participant.sessionId}-${index}`}
                  className="aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative group hover:border-slate-600 transition-colors"
                >
                  <ParticipantView
                    participant={item.participant}
                    trackType={item.type === "screen" ? "screenShareTrack" : "videoTrack"}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium flex items-center gap-1">
                    {item.type === "screen" ? (
                      <>
                        <Monitor className="w-3 h-3 text-blue-400" />
                        {item.participant.name || "Someone"}'s shared screen
                      </>
                    ) : (
                      <>
                        {item.participant.audioStream ? (
                          <Volume2 className="w-3 h-3 text-green-400" />
                        ) : (
                          <MicOff className="w-3 h-3 text-red-400" />
                        )}
                        {item.participant.name || "Unknown"}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      } else {
        // Regular grid without screen sharing
        return (
          <div className="w-full h-full p-4">
            <PaginatedGridLayout />
          </div>
        )
      }
    }

    // SPEAKER VIEW - Screen share as main speaker, participants in sidebar
    if (layoutType === "speaker") {
      if (isScreenSharing && screenSharingParticipant) {
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-7xl flex gap-4 items-start">
              {/* Main screen share area - fixed aspect ratio */}
              <div className="flex-1 max-w-4xl">
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                  <ParticipantView participant={screenSharingParticipant} trackType="screenShareTrack" />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-md px-3 py-1.5 text-white text-sm font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    {screenSharingParticipant.name || "Someone"}'s shared screen
                  </div>
                </div>
              </div>

              {/* Participants sidebar - fixed width */}
              <div className="w-72 flex flex-col gap-3">
                {participants.map((participant) => (
                  <div
                    key={participant.sessionId}
                    className="aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative group hover:border-slate-600 transition-colors"
                  >
                    <ParticipantView participant={participant} trackType="videoTrack" />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium flex items-center gap-1">
                      {participant.audioStream ? (
                        <Volume2 className="w-3 h-3 text-green-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      {participant.name || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      } else {
        // Regular speaker layout without screen sharing
        return (
          <div className="w-full h-full">
            <SpeakerLayout participantsBarPosition="right" />
          </div>
        )
      }
    }

    // AUTO LAYOUT - Compact screen sharing layout
    if (layoutType === "auto") {
      if (isScreenSharing && screenSharingParticipant) {
        return (
          <div className="w-full h-full flex items-center justify-center p-3">
            <div className="w-full max-w-7xl h-full max-h-[500px] flex gap-3">
              {/* Main screen share area - constrained aspect ratio */}
              <div className="flex-1 aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                <ParticipantView participant={screenSharingParticipant} trackType="screenShareTrack" />
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-blue-400" />
                  {screenSharingParticipant.name || "Someone"}'s shared screen
                </div>
              </div>

              {/* Compact participants sidebar - constrained */}
              <div className="w-56 flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.sessionId}
                    className="aspect-video bg-slate-800 rounded-md overflow-hidden border border-slate-700 relative group hover:border-slate-600 transition-colors flex-shrink-0"
                  >
                    <ParticipantView participant={participant} trackType="videoTrack" />
                    <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 text-white text-xs font-medium flex items-center gap-1">
                      {participant.audioStream ? (
                        <Volume2 className="w-2.5 h-2.5 text-green-400" />
                      ) : (
                        <MicOff className="w-2.5 h-2.5 text-red-400" />
                      )}
                      {participant.name?.split(" ")[0] || "User"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      // Regular auto layouts when no screen sharing
      if (participants.length === 1) {
        return (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="w-full max-w-4xl aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative group hover:border-slate-600 transition-colors">
              <ParticipantView participant={participants[0]} />
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-md px-3 py-2 text-white text-sm font-medium flex items-center gap-2">
                {participants[0].audioStream ? (
                  <Volume2 className="w-4 h-4 text-green-400" />
                ) : (
                  <MicOff className="w-4 h-4 text-red-400" />
                )}
                {participants[0].name || "Unknown User"}
              </div>
            </div>
          </div>
        )
      }

      if (participants.length === 2) {
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid grid-cols-2 gap-4">
              {participants.map((participant) => (
                <div
                  key={participant.sessionId}
                  className="aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative group hover:border-slate-600 transition-colors"
                >
                  <ParticipantView participant={participant} />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-md px-3 py-1.5 text-white text-sm font-medium flex items-center gap-2">
                    {participant.audioStream ? (
                      <Volume2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-400" />
                    )}
                    {participant.name || "Unknown User"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      // For more participants in auto mode, use paginated grid
      return (
        <div className="w-full h-full p-4">
          <PaginatedGridLayout />
        </div>
      )
    }

    return null
  }, [participants, isScreenSharing, screenSharingParticipant, layoutType])

  const toggleCamera = () => call?.camera.toggle()
  const toggleMic = () => call?.microphone.toggle()
  const toggleScreenShare = () => call?.screenShare.toggle()

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: hideStreamBanner }} />
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {videoLayout}

        {/* Floating Participant Count */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
          {participants.length} participant{participants.length !== 1 ? "s" : ""}
        </div>

        {/* Layout Type Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
          {layoutType === "grid" && "Grid View"}
          {layoutType === "speaker" && "Speaker View"}
          {layoutType === "auto" && "Auto Layout"}
          {isScreenSharing && " • Screen Sharing"}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl px-6 py-4 border border-slate-700/50 shadow-2xl">
          {/* Microphone */}
          <button
            onClick={toggleMic}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-105",
              isMicMuted
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                : "bg-slate-700 hover:bg-slate-600 text-white",
            )}
            title={isMicMuted ? "Unmute" : "Mute"}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-105",
              isCameraMuted
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                : "bg-slate-700 hover:bg-slate-600 text-white",
            )}
            title={isCameraMuted ? "Turn on camera" : "Turn off camera"}
          >
            {isCameraMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-105",
              isScreenSharing
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                : "bg-slate-700 hover:bg-slate-600 text-white",
            )}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Separator */}
          <div className="w-px h-8 bg-slate-600 mx-2" />

          {/* Participants */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 relative hover:scale-105">
              <Users className="w-5 h-5" />
              {participants.length > 1 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {participants.length}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-slate-800/95 backdrop-blur-xl border-slate-700 text-white rounded-xl shadow-2xl w-80 max-h-96"
              align="center"
              sideOffset={12}
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-300">Participants ({participants.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.sessionId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {participant.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{participant.name || "Unknown User"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {participant.audioStream ? (
                            <Mic className="w-3 h-3 text-green-400" />
                          ) : (
                            <MicOff className="w-3 h-3 text-red-400" />
                          )}
                          {participant.videoStream ? (
                            <Video className="w-3 h-3 text-green-400" />
                          ) : (
                            <VideoOff className="w-3 h-3 text-red-400" />
                          )}
                          {participant.screenShareStream && <Monitor className="w-3 h-3 text-blue-400" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 hover:scale-105">
              <Settings className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700 text-white rounded-xl shadow-2xl">
              <div className="p-2">
                <div className="text-xs text-slate-400 px-2 py-1 mb-1">Layout Options</div>
                <DropdownMenuItem
                  onClick={() => setLayoutType("grid")}
                  className={cn(
                    "hover:bg-slate-700/50 cursor-pointer rounded-lg mx-1 transition-colors",
                    layoutType === "grid" && "bg-blue-600/20 text-blue-300",
                  )}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid View
                  {layoutType === "grid" && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayoutType("speaker")}
                  className={cn(
                    "hover:bg-slate-700/50 cursor-pointer rounded-lg mx-1 transition-colors",
                    layoutType === "speaker" && "bg-blue-600/20 text-blue-300",
                  )}
                >
                  <Layout className="w-4 h-4 mr-2" />
                  Speaker View
                  {layoutType === "speaker" && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayoutType("auto")}
                  className={cn(
                    "hover:bg-slate-700/50 cursor-pointer rounded-lg mx-1 transition-colors",
                    layoutType === "auto" && "bg-blue-600/20 text-blue-300",
                  )}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Auto Layout
                  {layoutType === "auto" && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />}
                </DropdownMenuItem>
                <div className="text-xs text-slate-500 px-2 py-1 mt-1">
                  {isScreenSharing ? "Screen sharing active" : "All layouts work with screen sharing"}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separator */}
          <div className="w-px h-8 bg-slate-600 mx-2" />

          {/* End Call */}
          <EndCallButton roomCode={roomCode} endInterviewSession={endInterviewSession} />
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
        <div className="flex items-center gap-2 text-white text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Connected
        </div>
      </div>
    </div>
  )
}
