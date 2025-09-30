"use client"

import { useEffect, useState } from "react"

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("lero:watchlist")
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function WatchlistPane() {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    setItems(loadWatchlist())
    const onChange = () => setItems(loadWatchlist())
    window.addEventListener("storage", onChange)
    window.addEventListener("watchlist:changed", onChange as any)
    return () => {
      window.removeEventListener("storage", onChange)
      window.removeEventListener("watchlist:changed", onChange as any)
    }
  }, [])

  if (!items.length) {
    return <div className="font-mono text-green-500/80 text-sm">No items. Use "watch add &lt;mint|symbol&gt;".</div>
  }

  return (
    <div className="font-mono text-green-300">
      <div className="grid grid-cols-12 gap-2 pb-1 text-green-500/70 border-b border-green-400/20">
        <div className="col-span-8">Mint / Symbol</div>
        <div className="col-span-4">Actions</div>
      </div>
      {items.map((it, idx) => (
        <div key={`${it}-${idx}`} className="grid grid-cols-12 gap-2 py-1 border-b border-green-400/10">
          <div className="col-span-8 text-white truncate" title={it}>{it}</div>
          <div className="col-span-4">
            <a className="text-cyan-400 hover:underline" href={`https://dexscreener.com/solana/${it}`} target="_blank" rel="noreferrer">open</a>
          </div>
        </div>
      ))}
    </div>
  )
}

