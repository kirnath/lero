import type React from "react"
import { Promptline } from "./promptline"
import { Footerline } from "./footerline"
import { Pane } from "./pane"
import { Stack } from "./stack"
import { TrendingPane } from "./context/trending-pane"
import { WatchlistPane } from "./context/watchlist-pane"
import { OverlaysProvider } from "./overlay/overlays-provider"
import { HelpSheet } from "./overlay/help"

interface TerminalLayoutProps {
  children: React.ReactNode
}

export function TerminalLayout({ children }: TerminalLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-[#0b0f0c] text-green-400 overflow-hidden">
      <OverlaysProvider>
        <Promptline />
        <main className="max-w-6xl mx-auto p-3 flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 h-full">
            <div className="h-full overflow-hidden md:col-span-7 lg:col-span-8">
              <Stack
                tabs={[
                  {
                    id: "active",
                    label: "ACTIVE",
                    content: <div className="h-full min-h-[300px] overflow-hidden">{children}</div>,
                  },
                ]}
              />
            </div>
            <div className="md:block h-full overflow-hidden md:col-span-5 lg:col-span-4">
              <Stack
                tabs={[
                  {
                    id: "trending",
                    label: "TRENDING",
                    content: (
                      <Pane title="Context: Trending" statusRight={<span>feed: 24h</span>}>
                        <TrendingPane />
                      </Pane>
                    ),
                  },
                  {
                    id: "watchlist",
                    label: "WATCHLIST",
                    content: (
                      <Pane title="Context: Watchlist" statusRight={<span>local</span>}>
                        <WatchlistPane />
                      </Pane>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </main>
        <Footerline />
        <HelpSheet />
      </OverlaysProvider>
    </div>
  )
}
