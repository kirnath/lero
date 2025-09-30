"use client"

import { useState, useEffect } from "react"
import { Bot } from "lucide-react"

export function TerminalLoading() {
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-green-400">
        <Bot className="w-4 h-4" />
        <span className="text-xs font-mono">cloud@lero-term-1:</span>
      </div>
      <div className="flex items-center gap-2 text-green-300 font-mono">
        <span className="animate-pulse">Thinking...</span>
        <span className={`ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`}>█</span>
      </div>
    </div>
  )
}
