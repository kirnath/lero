"use client"

import { useEffect, useState } from "react"

interface SolData {
  price?: number
  priceChanges?: { [k: string]: { priceChangePercentage?: number } }
  lastUpdated?: number
}

export function Footerline() {
  const [sol, setSol] = useState<SolData | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchSol = async () => {
      try {
        const res = await fetch("/api/solPrice", { method: "POST", headers: { "Content-Type": "application/json" } })
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setSol(data)
      } catch {}
    }
    fetchSol()
    const id = setInterval(fetchSol, 300000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const price = sol?.price
  const change = sol?.priceChanges?.["24h"]?.priceChangePercentage
  const changeSign = typeof change === "number" && change >= 0 ? "+" : ""
  const changeCls = typeof change === "number" && change < 0 ? "text-red-400" : "text-green-400"

  return (
    <div className="sticky bottom-0 z-20 border-t border-green-400/30 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 py-2 font-mono text-[11px] sm:text-xs text-green-400 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-green-500/80">MODE</span>
          <span className="text-green-300">INSERT</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-green-500/80">Hints</span>
          <span className="text-green-300">Ctrl+K: Commands</span>
          <span className="text-green-300">Ctrl+J: Jump</span>
          <span className="text-green-300">F1: Help</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-green-500/80">SOL</span>
          <span className="text-white">{typeof price === "number" ? `$${price.toFixed(3)}` : "--"}</span>
          <span className={changeCls}>{typeof change === "number" ? `${changeSign}${change.toFixed(2)}%` : ""}</span>
        </div>
      </div>
    </div>
  )
}

