"use client"

import { useEffect, useState } from "react"

export function TrendingPane() {
  const [items, setItems] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await fetch("/api/trending", { method: "POST", headers: { "Content-Type": "application/json" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (mounted) setItems(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      }
    }
    run()
    const id = setInterval(run, 120000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  if (error) {
    return <div className="font-mono text-red-400 text-xs">[!] {error}</div>
  }

  if (!items) {
    return <div className="font-mono text-green-400 text-xs">Loading trending…</div>
  }

  return (
    <div className="font-mono text-green-300">
      <div className="grid grid-cols-12 gap-2 pb-1 text-green-500/70 border-b border-green-400/20">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Symbol</div>
        <div className="col-span-3">Price</div>
        <div className="col-span-4">Change</div>
      </div>
      <div>
        {items.slice(0, 20).map((item: any, idx: number) => {
          const sym = (item?.token?.symbol || "").replace("$", "")
          const price = item?.pools?.[0]?.price?.usd
          const ch = item?.events?.["24h"]?.priceChangePercentage
          const chSign = typeof ch === "number" && ch >= 0 ? "+" : ""
          const chCls = typeof ch === "number" && ch < 0 ? "text-red-400" : "text-green-400"
          return (
            <div key={idx} className="grid grid-cols-12 gap-2 py-1 border-b border-green-400/10">
              <div className="col-span-1 text-green-500/80">{String(idx + 1).padStart(2, "0")}</div>
              <div className="col-span-4 text-white truncate">{sym || "-"}</div>
              <div className="col-span-3">${typeof price === "number" ? (price < 1 ? price.toFixed(6) : price.toFixed(3)) : "N/A"}</div>
              <div className={`col-span-4 ${chCls}`}>{typeof ch === "number" ? `${chSign}${ch.toFixed(2)}%` : "--"}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

