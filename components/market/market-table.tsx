"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import type { TokenData } from "@/app/market/page" // Import the interface
import Image from "next/image"

interface MarketTableProps {
  tokens: TokenData[]
  loading: boolean
  watchlist: Set<string>
  toggleWatchlist: (tokenId: string) => void
  formatNumber: (num: number, decimals?: number) => string
  formatPrice: (price: number) => string
  getPriceChangeColor: (change: number) => string
  activeTab: "trending" | "new-pairs" | "new-markets" | "watchlist" // Add activeTab prop
}

export function MarketTable({
  tokens,
  loading,
  watchlist,
  toggleWatchlist,
  formatNumber,
  formatPrice,
  getPriceChangeColor,
  activeTab,
}: MarketTableProps) {
  return (
    <Card className="bg-gray-900/50 border-green-400/30">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-green-400/30 hover:bg-transparent">
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">TOKEN</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">AGE</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">LIQ</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">MCAP</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">PRICE</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm hidden sm:table-cell">5M%</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">1H%</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm hidden lg:table-cell">6H%</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">24H%</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm hidden md:table-cell">5M VOL</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm hidden lg:table-cell">1H VOL</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm hidden xl:table-cell">6H VOL</TableHead>
              <TableHead className="text-green-300 font-mono text-xs sm:text-sm">24H VOL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <TableRow key={i} className="border-green-400/20">
                  <TableCell colSpan={13} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></div>
                      <span className="text-green-400 font-mono text-sm ml-2">Loading market data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : tokens.length === 0 && activeTab !== "trending" ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-green-400 font-mono text-sm">
                  Under Construction: Data for this section will be available soon.
                </TableCell>
              </TableRow>
            ) : tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-green-400 font-mono text-sm">
                  No trending tokens found for the selected timeframe.
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id} className="border-green-400/20 hover:bg-green-400/5">
                  <TableCell className="font-mono">
                    <div className="flex items-center space-x-2">
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWatchlist(token.id)}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        <Star
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            watchlist.has(token.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"
                          }`}
                        />
                      </Button> */}
                      <Image src={token.image || "placeholder.svg"} alt={`${token.name}`} width={20} height={20} />
                      <div>
                        <div className="text-green-300 font-bold text-xs sm:text-sm hover:cursor-pointer hover:underline">${token.symbol}</div>
                        <div className="text-green-500/70 text-xs truncate max-w-20 sm:max-w-none">
                          {token.mint.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400">{token.age}</TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400">
                    {formatNumber(token.liquidity)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400">
                    {formatNumber(token.marketCap)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400">
                    ${formatPrice(token.price)}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-xs sm:text-sm hidden sm:table-cell ${getPriceChangeColor(token.priceChange5m)}`}
                  >
                    {token.priceChange5m > 0 ? "+" : ""}
                    {token.priceChange5m.toFixed(1)}%
                  </TableCell>
                  <TableCell className={`font-mono text-xs sm:text-sm ${getPriceChangeColor(token.priceChange1h)}`}>
                    {token.priceChange1h > 0 ? "+" : ""}
                    {token.priceChange1h.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={`font-mono text-xs sm:text-sm hidden lg:table-cell ${getPriceChangeColor(token.priceChange6h)}`}
                  >
                    {token.priceChange6h > 0 ? "+" : ""}
                    {token.priceChange6h.toFixed(1)}%
                  </TableCell>
                  <TableCell className={`font-mono text-xs sm:text-sm ${getPriceChangeColor(token.priceChange24h)}`}>
                    {token.priceChange24h > 0 ? "+" : ""}
                    {token.priceChange24h.toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400 hidden md:table-cell">
                    {formatNumber(token.volume5m)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400 hidden lg:table-cell">
                    {formatNumber(token.volume1h)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400 hidden xl:table-cell">
                    {formatNumber(token.volume6h)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm text-green-400">
                    {formatNumber(token.volume24h)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
