import type React from "react"

interface PaneProps {
  title: string
  children: React.ReactNode
  statusRight?: React.ReactNode
}

export function Pane({ title, children, statusRight }: PaneProps) {
  return (
    <div className="border border-green-400/25 rounded-md bg-[#0d120f]/80 h-full flex flex-col overflow-hidden shadow-[0_0_12px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-green-400/20 bg-green-900/5 flex-shrink-0">
        <div className="font-mono text-xs text-green-300 truncate">{title}</div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-[11px] text-green-500/80 truncate">{statusRight}</div>
          <div className="flex items-center gap-1 ml-2" aria-hidden="true">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400/80 shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          </div>
        </div>
      </div>
      <div className="p-2 sm:p-3 flex-1 min-h-0 overflow-auto pane-scroll">
        {children}
      </div>
    </div>
  )
}
