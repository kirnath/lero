"use client"

import { useState } from "react"
import type React from "react"

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface StackProps {
  tabs: Tab[]
  variant?: "default" | "minimal"
}

export function Stack({ tabs, variant = "default" }: StackProps) {
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id)
  const active = tabs.find((t) => t.id === activeId) || tabs[0]

  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <div className="flex items-center gap-1 mb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`font-mono text-xs px-2 py-1 rounded transition-colors border ${
              t.id === activeId
                ? "text-green-300 bg-green-900/20 border-green-400/30"
                : "text-green-500/70 hover:text-green-300 hover:bg-green-900/10 border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">{active?.content}</div>
    </div>
  )
}
