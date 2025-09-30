"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useOverlays } from "./overlays-provider"

export function CommandPalette() {
  const { paletteOpen, closePalette } = useOverlays()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (paletteOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [paletteOpen])

  if (!paletteOpen) return null

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") closePalette()
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value.trim().toLowerCase()
      if (val.startsWith("go markets")) router.push("/market")
      else if (val.startsWith("go about")) router.push("/about")
      else router.push("/")
      closePalette()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={closePalette} />
      <div className="relative w-full max-w-xl rounded-md border border-green-400/30 bg-black p-3 shadow-lg">
        <div className="font-mono text-xs text-green-400 mb-2">COMMANDS</div>
        <input
          ref={inputRef}
          placeholder="Type a command: go markets | go about"
          className="w-full bg-transparent outline-none font-mono text-green-200 placeholder:text-green-600/70"
          onKeyDown={onKeyDown}
        />
        <div className="mt-2 font-mono text-[11px] text-green-500/80">Enter to execute · Esc to close</div>
      </div>
    </div>
  )
}

