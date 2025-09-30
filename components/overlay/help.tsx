"use client"

import { useOverlays } from "./overlays-provider"

export function HelpSheet() {
  const { helpOpen, closeHelp } = useOverlays()
  if (!helpOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={closeHelp} />
      <div className="relative w-full max-w-2xl rounded-md border border-green-400/30 bg-black p-4 shadow-lg">
        <div className="font-mono text-xs text-green-400 mb-2">HELP</div>
        <div className="space-y-2 font-mono text-green-300 text-sm">
          <div>- Ctrl+K: Command Palette</div>
          <div>- Ctrl+J: Jump Navigator</div>
          <div>- F1: Help Sheet</div>
          <div>- cat solana.prc — Show SOL price</div>
          <div>- cat trendings.log — Show trending tokens</div>
        </div>
        <div className="mt-3 font-mono text-[11px] text-green-500/80">Click outside or press Esc to close</div>
      </div>
    </div>
  )
}

