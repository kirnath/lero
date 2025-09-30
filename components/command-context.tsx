"use client"

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

type CommandHandler = (command: string) => void | Promise<void>

interface CommandContextValue {
  submit: (command: string) => void
  setHandler: (fn: CommandHandler | null) => void
}

const CommandCtx = createContext<CommandContextValue | null>(null)

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const handlerRef = useRef<CommandHandler | null>(null)
  const [, force] = useState(0)

  const submit = useCallback((command: string) => {
    const fn = handlerRef.current
    if (fn) void fn(command)
  }, [])

  const setHandler = useCallback((fn: CommandHandler | null) => {
    handlerRef.current = fn
    // force update consumers if needed
    force((x) => x + 1)
  }, [])

  const value = useMemo<CommandContextValue>(() => ({ submit, setHandler }), [submit, setHandler])

  return <CommandCtx.Provider value={value}>{children}</CommandCtx.Provider>
}

export function useCommandSubmit() {
  const ctx = useContext(CommandCtx)
  if (!ctx) throw new Error("useCommandSubmit must be used within CommandProvider")
  return ctx.submit
}

export function useCommandRegister(fn: CommandHandler | null) {
  const ctx = useContext(CommandCtx)
  if (!ctx) throw new Error("useCommandRegister must be used within CommandProvider")
  const { setHandler } = ctx
  React.useEffect(() => {
    setHandler(fn)
    return () => setHandler(null)
  }, [fn, setHandler])
}

