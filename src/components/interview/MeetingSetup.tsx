"use client"

import { DeviceSettings, VideoPreview, useCall, useCallStateHooks } from "@stream-io/video-react-sdk"
import { Button } from "../ui/button"
import { Video, Mic, MicOff, VideoOff, Settings2, ArrowRight, AlertCircle, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MeetingSetup({ setIsSetupComplete }: { setIsSetupComplete: (value: boolean) => void }) {
  const call = useCall()
  const { useCameraState, useMicrophoneState } = useCallStateHooks()
  const { camera, isMute: isCameraMuted } = useCameraState()
  const { microphone, isMute: isMicMuted } = useMicrophoneState()

  const [isReady, setIsReady] = useState(false)
  const [permissionState, setPermissionState] = useState<{
    camera: PermissionState | "unknown"
    microphone: PermissionState | "unknown"
  }>({ camera: "unknown", microphone: "unknown" })
  const [showPermissionAlert, setShowPermissionAlert] = useState(false)

  // Check and request permissions
  const checkPermissions = async () => {
    try {
      // Check current permission states
      const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName })
      const microphonePermission = await navigator.permissions.query({ name: "microphone" as PermissionName })

      setPermissionState({
        camera: cameraPermission.state,
        microphone: microphonePermission.state,
      })

      // If permissions are denied or not granted, show alert
      if (cameraPermission.state === "denied" || microphonePermission.state === "denied") {
        setShowPermissionAlert(true)
        return false
      }

      // If permissions are prompt state, request them
      if (cameraPermission.state === "prompt" || microphonePermission.state === "prompt") {
        await requestPermissions()
      }

      return true
    } catch (error) {
      console.error("Permission check failed:", error)
      // Fallback: try to request permissions directly
      await requestPermissions()
      return true
    }
  }

  const requestPermissions = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Stop the stream immediately as we just needed permissions
      stream.getTracks().forEach((track) => track.stop())

      setShowPermissionAlert(false)
      return true
    } catch (error) {
      console.error("Permission request failed:", error)
      setShowPermissionAlert(true)
      return false
    }
  }

  useEffect(() => {
    const initializeDevices = async () => {
      if (call) {
        const hasPermissions = await checkPermissions()
        if (hasPermissions) {
          try {
            await call.camera.enable()
            await call.microphone.enable()
            setIsReady(true)
          } catch (error) {
            console.error("Failed to enable devices:", error)
            setShowPermissionAlert(true)
          }
        }
      }
    }

    initializeDevices()
  }, [call])

  if (!call) {
    throw new Error("useCall must be used within a StreamCall component.")
  }

  const handleJoin = async () => {
    await call.join({ create: true })
    setIsSetupComplete(true)
  }

  const toggleCamera = async () => {
    try {
      if (isCameraMuted) {
        await call.camera.enable()
      } else {
        await call.camera.disable()
      }
    } catch (error) {
      console.error("Camera toggle failed:", error)
      await requestPermissions()
    }
  }

  const toggleMic = async () => {
    try {
      if (isMicMuted) {
        await call.microphone.enable()
      } else {
        await call.microphone.disable()
      }
    } catch (error) {
      console.error("Microphone toggle failed:", error)
      await requestPermissions()
    }
  }

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions()
    if (granted && call) {
      try {
        await call.camera.enable()
        await call.microphone.enable()
        setIsReady(true)
      } catch (error) {
        console.error("Failed to enable devices after permission grant:", error)
      }
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-slate-900">
      {/* Permission Alert */}
      {showPermissionAlert && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200">
            <Shield className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Camera and microphone permissions are required for the interview.</span>
              <Button
                onClick={handleRequestPermissions}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white ml-4"
              >
                Grant Permissions
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Landscape Layout Container */}
      <div className="w-full max-w-4xl h-full max-h-[500px] flex gap-6">
        {/* Left Side - Video Preview */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
            {isReady && !showPermissionAlert ? (
              <VideoPreview />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-slate-400">
                  {showPermissionAlert ? (
                    <>
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                      <p className="text-sm">Permissions required</p>
                      <p className="text-xs mt-1">Please grant camera and microphone access</p>
                    </>
                  ) : (
                    <>
                      <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Initializing camera...</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Preview Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
              <button
                onClick={toggleMic}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isMicMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCameraMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {isCameraMuted ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
              <div className={`w-2 h-2 rounded-full ${isReady ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}></div>
              <span className="text-white text-xs font-medium">{isReady ? "Live Preview" : "Connecting..."}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Controls & Settings */}
        <div className="w-80 flex flex-col justify-center space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Interview Setup</h2>
            <p className="text-slate-400 text-sm">Configure your devices before joining</p>
          </div>

          {/* Device Settings */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Device Settings</span>
            </div>
            <DeviceSettings />
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <span className="text-sm text-slate-300">Microphone</span>
              <div className={`flex items-center gap-2 text-xs ${!isMicMuted ? "text-green-400" : "text-red-400"}`}>
                <div className={`w-2 h-2 rounded-full ${!isMicMuted ? "bg-green-400" : "bg-red-400"}`}></div>
                {!isMicMuted ? "Ready" : "Muted"}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <span className="text-sm text-slate-300">Camera</span>
              <div className={`flex items-center gap-2 text-xs ${!isCameraMuted ? "text-green-400" : "text-red-400"}`}>
                <div className={`w-2 h-2 rounded-full ${!isCameraMuted ? "bg-green-400" : "bg-red-400"}`}></div>
                {!isCameraMuted ? "Ready" : "Off"}
              </div>
            </div>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
            disabled={!isReady || showPermissionAlert}
          >
            <Video className="w-4 h-4 mr-2" />
            Join Interview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
