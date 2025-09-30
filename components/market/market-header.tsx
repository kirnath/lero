"use client"

import { Button } from "@/components/ui/button"
import type { TrendingUp } from "lucide-react"

interface MarketHeaderProps {
  activeTab: "trending" | "new-pairs" | "new-markets" | "watchlist"
  setActiveTab: (tab: "trending" | "new-pairs" | "new-markets" | "watchlist") => void
  timeFilter: "5m" | "1h" | "6h" | "24h" | "smart" | "top"
  setTimeFilter: (filter: "5m" | "1h" | "6h" | "24h" | "smart" | "top") => void
  tabs: { id: string; label: string; icon: typeof TrendingUp }[]
  timeFilters: { id: string; label: string }[]
}

export function MarketHeader({
  activeTab,
  setActiveTab,
  timeFilter,
  setTimeFilter,
  tabs,
  timeFilters,
}: MarketHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-mono text-xs sm:text-sm ${
                activeTab === tab.id
                  ? "bg-green-400/20 text-green-300 border-green-400/50"
                  : "text-green-400/70 hover:text-green-300"
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </Button>
          )
        })}
      </div>

      {/* Time Filters */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {timeFilters.map((filter) => (
          <Button
            key={filter.id}
            variant={timeFilter === filter.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeFilter(filter.id as any)}
            className={`font-mono text-xs ${
              timeFilter === filter.id
                ? "bg-green-400/20 text-green-300 border-green-400/50"
                : "text-green-400/70 hover:text-green-300"
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
