"use client"

import { Card } from "@/components/ui/card"
import type { TokenData } from "@/app/market/page" // Import the TokenData interface

interface MarketFooterStatsProps {
  tokens: TokenData[]
  watchlist: Set<string>
  formatNumber: (num: number, decimals?: number) => string
}

export function MarketFooterStats({ tokens, watchlist, formatNumber }: MarketFooterStatsProps) {
  return (
    <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      <Card className="bg-gray-900/50 border-green-400/30 p-3 sm:p-4">
        <div className="text-green-500/70 text-xs font-mono">TOTAL TOKENS</div>
        <div className="text-green-300 text-lg sm:text-xl font-mono font-bold">{tokens.length}</div>
      </Card>
      <Card className="bg-gray-900/50 border-green-400/30 p-3 sm:p-4">
        <div className="text-green-500/70 text-xs font-mono">24H VOLUME</div>
        <div className="text-green-300 text-lg sm:text-xl font-mono font-bold">
          {formatNumber(tokens.reduce((sum, token) => sum + token.volume24h, 0))}
        </div>
      </Card>
      <Card className="bg-gray-900/50 border-green-400/30 p-3 sm:p-4">
        <div className="text-green-500/70 text-xs font-mono">WATCHLIST</div>
        <div className="text-green-300 text-lg sm:text-xl font-mono font-bold">{watchlist.size}</div>
      </Card>
      <Card className="bg-gray-900/50 border-green-400/30 p-3 sm:p-4">
        <div className="text-green-500/70 text-xs font-mono">ACTIVE</div>
        <div className="text-green-300 text-lg sm:text-xl font-mono font-bold">
          {tokens.filter((t) => t.volume24h > 1000).length}
        </div>
      </Card>
    </div>
  )
}
