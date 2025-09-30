"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

interface OverlayState {
  paletteOpen: boolean
  jumpOpen: boolean
  helpOpen: boolean
  openPalette: () => void
  closePalette: () => void
  openJump: () => void
  closeJump: () => void
  openHelp: () => void
  closeHelp: () => void
}

const OverlayCtx = createContext<OverlayState | null>(null)

export function OverlaysProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [jumpOpen, setJumpOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const value = useMemo<OverlayState>(() => ({
    paletteOpen,
    jumpOpen,
    helpOpen,
    openPalette: () => setPaletteOpen(true),
    closePalette: () => setPaletteOpen(false),
    openJump: () => setJumpOpen(true),
    closeJump: () => setJumpOpen(false),
    openHelp: () => setHelpOpen(true),
    closeHelp: () => setHelpOpen(false),
  }), [paletteOpen, jumpOpen, helpOpen])

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey
      const k = e.key.toLowerCase()
      if (isCtrl && k === "k") {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("promptline:focus", { detail: { prefill: "" } }))
      } else if (isCtrl && k === "j") {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("promptline:focus", { detail: { prefill: "go " } }))
      } else if (e.key === "F1" || k === "f1") {
        e.preventDefault()
        setHelpOpen(true)
      } else if (e.key === "Escape") {
        setHelpOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return <OverlayCtx.Provider value={value}>{children}</OverlayCtx.Provider>
}

export function useOverlays() {
  const ctx = useContext(OverlayCtx)
  if (!ctx) throw new Error("useOverlays must be used within OverlaysProvider")
  return ctx
}
