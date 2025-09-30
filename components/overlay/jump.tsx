"use client"

import { useOverlays } from "./overlays-provider"

export function JumpNavigator() {
  const { jumpOpen, closeJump } = useOverlays()
  if (!jumpOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={closeJump} />
      <div className="relative w-full max-w-xl rounded-md border border-green-400/30 bg-black p-3 shadow-lg">
        <div className="font-mono text-xs text-green-400 mb-2">JUMP</div>
        <div className="font-mono text-green-300 text-sm">Quick navigation coming soon (tabs, panes, tokens)…</div>
        <div className="mt-2 font-mono text-[11px] text-green-500/80">Esc to close</div>
      </div>
    </div>
  )
}

