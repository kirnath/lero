"use client"

import { useEffect, useMemo, useState } from "react"
import { Pane } from "@/components/pane"

export default function MarketPage() {
  const [items, setItems] = useState<any[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/trending?timeframe=24h`, { method: "POST", headers: { "Content-Type": "application/json" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load markets")
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const statusRight = useMemo(() => (
    <span>24H · {loading ? "loading" : `${items?.length ?? 0} tokens`}</span>
  ), [loading, items])

  const formatLines = () => {
    if (!items || items.length === 0) return ["(no tokens)"]
    const lines: string[] = []
    const hdr = ["#", "SYMBOL", "PRICE", "CHANGE", "MCAP", "MINT"].map((h) => h.padEnd(8, " ")).join("  ")
    lines.push(hdr)
    lines.push("".padEnd(hdr.length, "-"))
    ;(items as any[]).slice(0, 50).forEach((it, i) => {
      const index = String(i + 1).padStart(2, "0").padEnd(8, " ")
      const sym = ((it?.token?.symbol || "").replace("$", "") || "-").padEnd(8, " ")
      const price = it?.pools?.[0]?.price?.usd
      const priceStr = typeof price === "number" ? (price < 1 ? price.toFixed(6) : price.toFixed(3)) : "N/A"
      const priceCell = (`$${priceStr}`).padEnd(8, " ")
      const ch = it?.events?.["24h"]?.priceChangePercentage
      const chSign = typeof ch === "number" && ch >= 0 ? "+" : ""
      const chStr = typeof ch === "number" ? `${chSign}${ch.toFixed(2)}%` : "--"
      const chCell = chStr.padEnd(8, " ")
      const mcap = it?.pools?.[0]?.marketCap?.usd
      let mcapStr: string
      if (typeof mcap === "number") {
        if (mcap >= 1e9) mcapStr = `${(mcap / 1e9).toFixed(1)}B`
        else if (mcap >= 1e6) mcapStr = `${(mcap / 1e6).toFixed(1)}M`
        else if (mcap >= 1e3) mcapStr = `${(mcap / 1e3).toFixed(1)}K`
        else mcapStr = `${mcap.toFixed(0)}`
      } else {
        mcapStr = "N/A"
      }
      const mcapCell = mcapStr.padEnd(8, " ")
      const mint = (it?.token?.mint || "")
      const short = mint ? mint.slice(0, 4) + "…" + mint.slice(-4) : ""
      const mintCell = short.padEnd(8, " ")
      lines.push([index, sym, priceCell, chCell, mcapCell, mintCell].join("  "))
    })
    return lines
  }

  return (
    <Pane title="Markets" statusRight={statusRight}>
      {error && <div className="mb-2 font-mono text-sm text-red-400">[!] {error}</div>}
      {loading ? (
        <div className="font-mono text-green-400 text-sm">Loading markets…</div>
      ) : (
        <pre className="font-mono text-green-300 text-sm whitespace-pre-wrap">{formatLines().join("\n")}</pre>
      )}
    </Pane>
  )
}
