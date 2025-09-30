"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useOverlays } from "./overlay/overlays-provider"
import { useCommandSubmit } from "./command-context"

export function Promptline() {
  const router = useRouter()
  const { openHelp } = useOverlays()
  const submitCommand = useCommandSubmit()
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState<number>(-1)

  // Load history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lero:history")
      if (raw) setHistory(JSON.parse(raw) as string[])
    } catch {}
  }, [])

  const saveHistory = (arr: string[]) => {
    try { localStorage.setItem("lero:history", JSON.stringify(arr.slice(-200))) } catch {}
  }

  const known = useMemo(
    () => [
      "help", "!help", "commands", "!commands", "--help", "clear", "!clear",
      "cat solana.prc", "cat trendings.log", "cat markets.log",
      "go markets", "go about", "go home", "go session",
      "watch add ", "watch rm ", "watch list",
      "wallet ",
    ],
    [],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault()
        if (!value) setValue("go ")
      }
      if (e.key === "F1") {
        e.preventDefault()
        openHelp()
      }
      if (e.key === "Enter") {
        // Fast-path navigation for go/open/cd to prevent chat fallback on typos
        const nav = value.trim()
        const m = nav.match(/^(?:go|open|cd)\s+\/?(markets?|about|home|session)\/?\s*$/i)
        if (m) {
          const view = m[1].toLowerCase()
          const dest = view.startsWith("market") ? "/market" : view === "about" ? "/about" : "/"
          router.push(dest)
          setValue("")
          return
        }
        const cmd = value.trim()
        if (cmd) {
          submitCommand(cmd)
          const next = [...history, cmd]
          setHistory(next)
          saveHistory(next)
          setValue("")
          setHIndex(-1)
        }
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        const idx = hIndex < 0 ? history.length - 1 : Math.max(0, hIndex - 1)
        if (history[idx] != null) {
          setHIndex(idx)
          setValue(history[idx])
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        const idx = hIndex < 0 ? -1 : Math.min(history.length - 1, hIndex + 1)
        if (idx === -1) {
          setHIndex(-1)
          setValue("")
        } else if (history[idx] != null) {
          setHIndex(idx)
          setValue(history[idx])
        }
      }
      if (e.key === "Tab") {
        e.preventDefault()
        const v = value
        if (v) {
          const hit = known.find((k) => k.startsWith(v))
          if (hit) setValue(hit)
        }
      }
    },
    [router, openHelp, submitCommand, value, history, hIndex, known],
  )

  return (
    <div className="sticky top-0 z-30 border-b border-green-400/30 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 py-2 font-mono text-xs sm:text-sm text-green-300">
        <div className="flex items-center gap-2">
          <span className="text-green-400">user@lero</span>
          <span className="opacity-60">::</span>
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-green-600/70 text-green-200"
            placeholder="type a command… (Ctrl+J to jump: 'go markets' | 'go about')"
            onKeyDown={onKeyDown}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <kbd className="opacity-70">Ctrl+K</kbd>
          <span className="opacity-70">Focus</span>
        </div>
      </div>
    </div>
  )
}

// Focus the promptline on global events
if (typeof window !== "undefined") {
  window.addEventListener("promptline:focus", (e: Event) => {
    const detail = (e as CustomEvent).detail as { prefill?: string } | undefined
    const el = document.querySelector<HTMLInputElement>('input[placeholder^="type a command"]')
    if (el) {
      el.focus()
      if (detail?.prefill != null) {
        el.value = detail.prefill
        const evt = new Event('input', { bubbles: true })
        el.dispatchEvent(evt)
      }
    }
  })
}
